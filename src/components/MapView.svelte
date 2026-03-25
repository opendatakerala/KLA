<script>
  import MapController from './MapController.svelte';
</script>

<MapController />
<div class="map-view" id="map-view">
  <div class="map-outer">
    <div class="map-container" id="map-container">
      <div id="kerala-map"></div>
      <div class="map-mode-row">
        <button class="map-mode-btn all active" data-mode="alliance" data-i18n="map.all">All</button>
        <button class="map-mode-btn ldf" data-mode="ldf">LDF</button>
        <button class="map-mode-btn udf" data-mode="udf">UDF</button>
        <button class="map-mode-btn nda" data-mode="nda">NDA</button>
      </div>
      <div class="map-legend" id="map-legend">
        <div class="map-legend-title" data-i18n="map.alliance">Alliance</div>
        <div class="map-legend-item"><div class="map-legend-dot" style="background:#EE0000;border:1.5px solid #c00;"></div>LDF</div>
        <div class="map-legend-item"><div class="map-legend-dot" style="background:#0078FF;border:1.5px solid #005ecc;"></div>UDF</div>
        <div class="map-legend-item"><div class="map-legend-dot" style="background:#FF9933;border:1.5px solid #e07000;"></div>NDA</div>
        <div style="margin-top:4px;border-top:1px solid var(--border);padding-top:6px;">
          <div class="map-legend-item"><div class="map-legend-dot" style="background:var(--sc-bg);border:1.5px solid var(--sc-color);"></div><span data-i18n="map.scReserved">SC Reserved</span></div>
          <div class="map-legend-item"><div class="map-legend-dot" style="background:var(--st-bg);border:1.5px solid var(--st-color);"></div><span data-i18n="map.stReserved">ST Reserved</span></div>
        </div>
      </div>
      <div class="map-tooltip" id="map-tooltip"></div>
    </div>
    <div class="map-panel">
      <div class="map-panel-header">
        <div class="map-panel-header-row">
          <button class="map-women-btn" id="map-women-btn">
            <span>♀</span> <span data-i18n="map.women">Women</span>
          </button>
          <button class="map-clear-btn" id="map-clear-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            <span data-i18n="map.clear">Clear</span>
          </button>
        </div>
      </div>
      <div class="map-panel-body" id="panel-body">
        <div class="map-panel-section-label" data-i18n="map.party">Party</div>
        <div class="party-filter" id="party-filter"></div>
        <div class="map-panel-section-label" style="margin-top:10px" data-i18n="map.district">District</div>
        <div class="dist-filter" id="dist-filter"></div>
        <div class="const-detail" id="const-detail"></div>
      </div>
    </div>
  </div>
</div>
