let currentMetric = 'compute';
let currentChart = null;

function createVisualization() {
    const width = document.getElementById('mainChart').offsetWidth;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    d3.select("#mainChart").html("");

    const svg = d3.select("#mainChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain([2012, 2023])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLog()
        .domain([
            d3.min(modelData, d => d[currentMetric]) / 2,
            d3.max(modelData, d => d[currentMetric]) * 2
        ])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2e")));

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const bubbles = svg.selectAll("circle")
        .data(modelData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d[currentMetric]))
        .attr("r", 8)
        .attr("fill", d => d.color)
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 12)
                .attr("opacity", 1);

            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            
            tooltip.html(`
                <strong>${d.model}</strong> (${d.year})<br/>
                ${currentMetric}: ${d[currentMetric]}<br/>
                ${d.description}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            updateModelDetails(d);
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8)
                .attr("opacity", 0.7);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function updateModelDetails(model) {
    const details = document.getElementById('modelDetails');
    details.innerHTML = `
        <h3>${model.model} (${model.year})</h3>
        <p>${model.description}</p>
        <div class="model-stats">
            <div class="stat-card">
                <div class="stat-value">${model.compute.toExponential(2)}</div>
                <div class="stat-label">Compute (PF/s-days)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(model.parameters/1e9).toFixed(1)}B</div>
                <div class="stat-label">Parameters</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${model.performance}%</div>
                <div class="stat-label">Performance</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${model.impact}</div>
                <div class="stat-label">Impact</div>
            </div>
        </div>
    `;
}

function createTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: modelData.map(d => d.year),
            datasets: [{
                label: 'Model Performance',
                data: modelData.map(d => d.performance),
                borderColor: '#1a73e8',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Evolution'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    createVisualization();
    createTrendChart();

    document.querySelectorAll('.metric-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.metric-btn').forEach(b => 
                b.classList.remove('active'));
            this.classList.add('active');
            currentMetric = this.dataset.metric;
            createVisualization();
        });
    });

    window.addEventListener('resize', function() {
        createVisualization();
        createTrendChart();
    });
});