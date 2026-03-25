<script>
    import { onMount } from "svelte";
    import {
        filterStore,
        districtStore,
        searchStore,
        modalStore,
        closeModal,
    } from "../stores/gridStore.js";
    import HistoricalChart from "./HistoricalChart.svelte";

    export let data = [];
    export let total = 0;
    export let historicalData = null;

    let filteredData = [];
    let activeFilter = "all";
    let activeDistrict = "all";
    let searchQuery = "";
    let currentModal = null;
    let seriesData = [];
    let tFunc = (k) => k;
    let tReplaceFunc = (k, r) => k;

    onMount(async () => {
        const i18n = await import("../lib/i18n.js");
        tFunc = i18n.t;
        tReplaceFunc = i18n.tReplace;
    });

    $: {
        filteredData = data.filter((row) => {
            if (activeDistrict !== "all" && row.District !== activeDistrict)
                return false;

            const candidates = row.candidates || [];

            if (activeFilter === "SC") return row.reservation === "SC";
            if (activeFilter === "ST") return row.reservation === "ST";
            if (activeFilter === "LDF")
                return candidates.some((c) => c.alliance === "LDF" && c.name);
            if (activeFilter === "UDF")
                return candidates.some((c) => c.alliance === "UDF" && c.name);
            if (activeFilter === "NDA")
                return candidates.some((c) => c.alliance === "NDA" && c.name);
            if (activeFilter === "female") {
                return candidates.some((c) => c.gender === "female");
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase().trim();
                return (
                    row.constituency_Name.toLowerCase().includes(q) ||
                    row.District.toLowerCase().includes(q) ||
                    candidates.some(
                        (c) =>
                            (c.name || "").toLowerCase().includes(q) ||
                            (c.party || "").toLowerCase().includes(q),
                    )
                );
            }

            return true;
        });
    }

    filterStore.subscribe((value) => {
        activeFilter = value;
    });

    districtStore.subscribe((value) => {
        activeDistrict = value;
    });

    searchStore.subscribe((value) => {
        searchQuery = value;
    });

    modalStore.subscribe((value) => {
        currentModal = value;
        if (value) {
            seriesData = getHistoricalData(value.constituency_Wikidata);
        }
    });

    function getResultsInfo() {
        if (searchQuery) {
            return (
                tReplaceFunc("results.showingFiltered", {
                    shown: filteredData.length,
                    total,
                }) +
                " · " +
                tFunc("results.search") +
                ': "' +
                searchQuery +
                '"'
            );
        } else if (activeDistrict !== "all" || activeFilter !== "all") {
            return tReplaceFunc("results.showingFiltered", {
                shown: filteredData.length,
                total,
            });
        } else {
            return tReplaceFunc("results.showingAll", { count: total });
        }
    }

    function getHistoricalData(wikidata) {
        if (!wikidata || !historicalData) return [];

        const years = Object.keys(historicalData.years || {})
            .slice()
            .reverse();
        const constData = historicalData.byConstituency;
        const result = [];

        years.forEach((year) => {
            const yearLabel = historicalData.years[year];
            const yearConstituencyData = constData[yearLabel]?.[wikidata];

            if (yearConstituencyData?.candidates) {
                const allianceVotes = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
                let totalVotes = 0;

                yearConstituencyData.candidates.forEach((c) => {
                    const votes = c.votes || 0;
                    totalVotes += votes;
                    if (
                        c.alliance &&
                        allianceVotes.hasOwnProperty(c.alliance)
                    ) {
                        allianceVotes[c.alliance] += votes;
                    } else {
                        allianceVotes["Others"] += votes;
                    }
                });

                result.push({
                    year: yearLabel,
                    allianceVotes,
                    totalVotes,
                });
            }
        });

        return result;
    }

    function createCandidateRow(alliance, party, name) {
        const allianceClass =
            alliance === "LDF"
                ? "LDF"
                : alliance === "UDF"
                  ? "UDF"
                  : alliance === "NDA"
                    ? "NDA"
                    : "OTH";
        const allianceLabel = alliance === "OTH" ? "Others" : alliance;
        return `
      <div class="candidate-row">
        <span class="alliance-tag ${allianceClass}">${allianceLabel}</span>
        <div>
          <div class="candidate-party">${party || "—"}</div>
          <span class="candidate-name">${name || tFunc("modal.tbd")}</span>
        </div>
      </div>
    `;
    }

    function createModalCandidate(alliance, color, party, name) {
        const tbd = !name;
        return `
      <div class="modal-candidate">
        <div class="modal-alliance-bar" style="background:${color}"></div>
        <div class="modal-candidate-inner">
          <div class="modal-alliance-label">${alliance}</div>
          <div class="modal-party" style="color:#000">${party || "—"}</div>
          <div class="modal-candidate-name${tbd ? " tbd" : ""}">${name || tFunc("modal.toBeAnnounced")}</div>
        </div>
      </div>
    `;
    }

    function handleCardClick(row) {
        modalStore.set(row);
    }

    function handleCloseModal() {
        modalStore.set(null);
    }
</script>

<div class="results-info" id="results-info">
    {getResultsInfo()}
</div>

<div class="grid" id="grid">
    {#each filteredData as row (row.constituency_Number)}
        <div
            class="card {row.reservation === 'SC'
                ? 'reserved-sc'
                : row.reservation === 'ST'
                  ? 'reserved-st'
                  : ''}"
            on:click={() => handleCardClick(row)}
            on:keydown={(e) => e.key === "Enter" && handleCardClick(row)}
            role="button"
            tabindex="0"
        >
            <div class="card-header">
                <div>
                    <div class="card-num">
                        CONSTITUENCY #{row.constituency_Number}
                    </div>
                    <div class="card-name">{row.constituency_Name}</div>
                    <div class="card-district">{row.District}</div>
                </div>
                {#if row.reservation}
                    <span
                        class="reservation-badge {row.reservation.toLowerCase()}"
                    >
                        {row.reservation}
                        <span data-i18n="modal.reserved">Reserved</span>
                    </span>
                {/if}
            </div>
            <div class="card-candidates">
                {#each row.candidates.filter((c) => c.alliance === "LDF") as c}
                    {@html createCandidateRow("LDF", c.party, c.name)}
                {/each}
                {#each row.candidates.filter((c) => c.alliance === "UDF") as c}
                    {@html createCandidateRow("UDF", c.party, c.name)}
                {/each}
                {#each row.candidates.filter((c) => c.alliance === "NDA") as c}
                    {@html createCandidateRow("NDA", c.party, c.name)}
                {/each}
                {#each row.candidates.filter((c) => c.alliance === "Others") as c}
                    {@html createCandidateRow("OTH", c.party, c.name)}
                {/each}
            </div>
        </div>
    {/each}

    {#if filteredData.length === 0}
        <div class="empty-state">
            <span data-i18n="results.empty"
                >No constituencies match your search.</span
            >
        </div>
    {/if}
</div>

{#if currentModal}
    <div
        class="modal-overlay open"
        on:click={handleCloseModal}
        on:keydown={(e) => e.key === "Escape" && handleCloseModal()}
        role="button"
        tabindex="0"
    >
        <div
            class="modal"
            on:click|stopPropagation
            on:keydown|stopPropagation
            role="dialog"
        >
            <div class="modal-top"></div>
            <div class="modal-header">
                <div class="modal-eyebrow">
                    {currentModal.District} · Constituency #{currentModal.constituency_Number}
                </div>
                <div class="modal-title">{currentModal.constituency_Name}</div>
                <div class="modal-badges">
                    {#if currentModal.reservation}
                        <span
                            class="reservation-badge {currentModal.reservation.toLowerCase()}"
                        >
                            {currentModal.reservation}
                            <span data-i18n="modal.reserved">Reserved</span>
                        </span>
                    {/if}
                </div>
                <button class="modal-close" on:click={handleCloseModal}>
                    <span data-i18n="modal.close">✕ Close</span>
                </button>
            </div>
            <div class="modal-body">
                <div
                    class="modal-section-label"
                    data-i18n="modal.contestingCandidates"
                >
                    Contesting Candidates
                </div>
                <div class="modal-candidates">
                    {#each currentModal.candidates.filter((c) => c.alliance === "LDF") as c}
                        {@html createModalCandidate(
                            "LDF",
                            "#D94040",
                            c.party,
                            c.name,
                        )}
                    {/each}
                    {#each currentModal.candidates.filter((c) => c.alliance === "UDF") as c}
                        {@html createModalCandidate(
                            "UDF",
                            "#1565C0",
                            c.party,
                            c.name,
                        )}
                    {/each}
                    {#each currentModal.candidates.filter((c) => c.alliance === "NDA") as c}
                        {@html createModalCandidate(
                            "NDA",
                            "#E07828",
                            c.party,
                            c.name,
                        )}
                    {/each}
                    {#each currentModal.candidates.filter((c) => c.alliance === "Others") as c}
                        {@html createModalCandidate(
                            c.party || "Others",
                            "#33AA55",
                            c.party,
                            c.name,
                        )}
                    {/each}
                </div>

                {#if currentModal.constituency_Wikidata}
                    <div class="modal-section-label">
                        Historical Results (Lok Sabha)
                    </div>
                    <HistoricalChart {seriesData} />
                {/if}
            </div>
        </div>
    </div>
{/if}

<svelte:window on:keydown={(e) => e.key === "Escape" && handleCloseModal()} />
