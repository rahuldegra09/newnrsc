import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function ChartComponent({ fetchedData }) {
    const chartRef = useRef(null);
    // Define renderChart function
    const renderChart = () => {
        const ctx = chartRef.current.getContext('2d');
        const years = fetchedData.map(entry => entry.data.map(tempEntry => tempEntry.year)).flat();
        const temperatures = fetchedData.map(entry => entry.data.map(tempEntry => tempEntry.temperature)).flat();

        const data = {
            labels: years,
            datasets: [
                {
                    label: 'Temperature data for these particular years',
                    data: temperatures,
                    borderColor: 'red',
                    fill: true,
                    pointRadius: 8,
                },
            ],
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                animation: {
                    tension: {
                        duration: 500, // Duration in milliseconds
                        easing: 'linear', // Easing function
                        from: 1, // Initial tension value
                        to: 0, // Final tension value
                        loop: true // Loop animation
                    },
                },
            },
        };

        if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
        }

        chartRef.current.chart = new Chart(ctx, config);
    };

    useEffect(() => {
        if (fetchedData) {
            renderChart(); // eslint-disable-next-line
        }
    }, [fetchedData]);

    return <canvas ref={chartRef}></canvas>;
}

export default ChartComponent;
