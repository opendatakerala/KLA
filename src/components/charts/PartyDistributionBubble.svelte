<script>
  import * as echarts from 'echarts/core';
  import * as d3 from 'd3';
  import { CustomChart } from 'echarts/charts';
  import { TooltipComponent, DatasetComponent, VisualMapComponent } from 'echarts/components';
  import { SVGRenderer } from 'echarts/renderers';

  // Register all required components, including CustomChart
  echarts.use([TooltipComponent, DatasetComponent, VisualMapComponent, SVGRenderer, CustomChart]);

  import candidatesByParty from '../../data/candidates-by-party.json';
  import { getPartyColor, ALLIANCE_COLORS } from '../../lib/constants.js';

  let { isActive = false } = $props();
  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];

  function prepareData() {
    const seriesData = [];
    let totalCandidates = 0;

    seriesData.push({ id: 'Kerala', depth: 0, index: 0 });

    ALLIANCES.forEach(alliance => {
      const parties = candidatesByParty[alliance] || {};
      let allianceTotal = 0;
      
      const allianceId = `Kerala.${alliance}`;
      const allianceIndex = seriesData.length;
      
      seriesData.push({ 
        id: allianceId, 
        name: alliance, 
        depth: 1, 
        type: 'alliance',
        index: allianceIndex 
      });

      Object.entries(parties).forEach(([partyName, value]) => {
        if (value > 0) {
          allianceTotal += value;
          seriesData.push({
            id: `${allianceId}.${partyName}`,
            name: partyName,
            value: value,
            depth: 2,
            type: 'party',
            alliance: alliance,
            index: seriesData.length
          });
        }
      });

      seriesData[allianceIndex].value = allianceTotal;
      totalCandidates += allianceTotal;
    });

    seriesData[0].value = totalCandidates;
    return seriesData;
  }

  function buildChartOption(seriesData, displayRoot) {
    const getColor = (node) => {
      if (node.depth === 1) return ALLIANCE_COLORS[node.data.name] || '#eee';
      if (node.depth === 2) return getPartyColor(node.data.alliance);
      return '#ffffff';
    };

    function overallLayout(params, api) {
      const context = params.context;
      // Add a margin so the external 'top' labels don't get clipped by the canvas edge
      const margin = 35; 
      
      d3.pack()
        .size([api.getWidth() - (margin * 2), api.getHeight() - (margin * 2)])
        .padding(6)(displayRoot);
      
      context.nodes = {};
      displayRoot.descendants().forEach(node => {
        // Offset the coordinates by the margin to center the layout
        node.x += margin;
        node.y += margin;
        context.nodes[node.id] = node;
      });
    }

    function renderItem(params, api) {
      const context = params.context;
      
      if (!context.layout) {
        context.layout = true;
        overallLayout(params, api);
      }

      const nodePath = api.value('id');
      const node = context.nodes[nodePath];
      
      if (!node) return; 

      const isLeaf = !node.children || !node.children.length;
      const isAlliance = node.depth === 1;
      
      const focus = new Uint32Array(
        node.descendants().map(n => n.data.index)
      );

      const z2 = api.value('depth') * 2;
      const r = Math.max(0, node.r);

      // Determine text content based on depth
      let textStr = '';
      if (isAlliance && r > 10) {
        textStr = node.data.name; 
      } else if (isLeaf && r > 15) {
        textStr = node.data.name;
      }

      return {
        type: 'circle',
        focus: focus,
        shape: { cx: node.x, cy: node.y, r: r },
        transition: ['shape'],
        z2: z2,
        style: {
          fill: getColor(node),
          stroke: isAlliance ? '#333' : 'transparent',
          lineWidth: isAlliance ? 1 : 0,
          fillOpacity: isAlliance ? 0.15 : 1 // Lighter opacity for parent bounds
        },
        emphasis: {
          style: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
            stroke: '#000',
            lineWidth: 2
          }
        },
        textContent: {
          type: 'text',
          style: {
            text: textStr,
            fontFamily: 'Manjari, sans-serif',
            // Bold and slightly larger for Alliance titles
            fontSize: isAlliance ? 15 : Math.min(r / 2.5, 12),
            fontWeight: isAlliance ? 'bold' : 'normal',
            fill: isAlliance ? '#374151' : '#111827',
            textAlign: 'center',
            textVerticalAlign: 'middle',
            width: isAlliance ? 200 : r * 1.8, // Give external labels more width
            overflow: 'truncate'
          }
        },
        textConfig: { 
          // Move Alliance labels outside (top), keep Party labels inside
          position: isAlliance ? 'top' : 'inside',
          distance: isAlliance ? 8 : 0
        }
      };
    }

    return {
      dataset: { source: seriesData },
      tooltip: {
        formatter: function(params) {
          const data = params.data;
          if (data.depth === 0) return `<b>Kerala Total</b><br/>${data.value} Candidates`;
          if (data.depth === 1) return `<b>${data.name} (Alliance)</b><br/>${data.value} Candidates`;
          return `<b>${data.name}</b><br/>Alliance: ${data.alliance}<br/>Candidates: ${data.value}`;
        }
      },
      hoverLayerThreshold: Infinity,
      series: {
        type: 'custom',
        renderItem: renderItem,
        progressive: 0,
        coordinateSystem: 'none',
        encode: {
          tooltip: 'value',
          itemName: 'id'
        }
      }
    };
  }

  function echartsAction(node, activeState) {
    let chart;
    let resizeObserver;
    const seriesData = prepareData();
    let displayRoot;

    function stratifyData() {
      return d3.stratify()
        .parentId(d => d.id.substring(0, d.id.lastIndexOf('.')))
        (seriesData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    }

    function init() {
      if (chart) return;
      chart = echarts.init(node, null, { renderer: 'svg' });
      
      displayRoot = stratifyData();
      chart.setOption(buildChartOption(seriesData, displayRoot), true);

      chart.on('click', { seriesIndex: 0 }, function (params) {
        drillDown(params.data.id);
      });

      chart.getZr().on('click', function (event) {
        if (!event.target) drillDown();
      });

      resizeObserver = new ResizeObserver(() => {
        if (chart) chart.resize();
      });
      resizeObserver.observe(node);
    }

    function drillDown(targetNodeId = null) {
      displayRoot = stratifyData();
      if (targetNodeId != null) {
        displayRoot = displayRoot.descendants().find(n => n.data.id === targetNodeId) || displayRoot;
      }
      displayRoot.parent = null; 
      
      chart.setOption({
        dataset: { source: seriesData } 
      });
    }

    function destroy() {
      if (resizeObserver) resizeObserver.disconnect();
      if (chart) {
        chart.dispose();
        chart = null;
      }
    }

    if (activeState) requestAnimationFrame(init);

    return {
      update(newActiveState) {
        if (newActiveState && !chart) requestAnimationFrame(init);
        else if (!newActiveState && chart) destroy();
      },
      destroy
    };
  }
</script>

<div class="party-bubble" use:echartsAction={isActive}></div>

<style>
  .party-bubble {
    width: 100%;
    min-height: 800px;
    height: 100%;
  }
</style>