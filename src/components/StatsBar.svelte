<script>
  export let stats = { ldf: 0, udf: 0, nda: 0, sc: 0, st: 0 };
</script>

<div class="stats-row">
  <div class="stat-cell ldf">
    <div class="stat-n" id="stat-ldf">{stats.ldf}</div>
    <div class="stat-label" data-i18n="stats.ldf">LDF Candidates</div>
  </div>
  <div class="stat-cell udf">
    <div class="stat-n" id="stat-udf">{stats.udf}</div>
    <div class="stat-label" data-i18n="stats.udf">UDF Candidates</div>
  </div>
  <div class="stat-cell nda">
    <div class="stat-n" id="stat-nda">{stats.nda}</div>
    <div class="stat-label" data-i18n="stats.nda">NDA Candidates</div>
  </div>
  <div class="stat-cell sc">
    <div class="stat-n" id="stat-sc">{stats.sc}</div>
    <div class="stat-label" data-i18n="stats.sc">SC Reserved</div>
  </div>
  <div class="stat-cell st">
    <div class="stat-n" id="stat-st">{stats.st}</div>
    <div class="stat-label" data-i18n="stats.st">ST Reserved</div>
  </div>
</div>
