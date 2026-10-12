// Canvas text cannot inherit CSS colors. Read the fork's tokens at each draw.
import Chart from "chart.js/auto";

Chart.register({
    id: "ui-fork-chart-theme",
    beforeUpdate(chart) {
        const style = getComputedStyle(chart.canvas);
        const text = style.getPropertyValue("--ui-muted").trim();
        const border = style.getPropertyValue("--ui-border").trim();
        if (!text || !border) return;

        for (const scale of Object.values(chart.config.options.scales ?? {})) {
            scale.ticks ??= {};
            scale.ticks.color = text;
            scale.grid ??= {};
            scale.grid.color = border;
            scale.border ??= {};
            scale.border.color = border;
        }
    },
});

// Redraw existing canvas labels when the existing theme control changes mode.
new MutationObserver(() => {
    for (const chart of Object.values(Chart.instances)) {
        chart.update("none");
    }
}).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bs-theme"],
});
