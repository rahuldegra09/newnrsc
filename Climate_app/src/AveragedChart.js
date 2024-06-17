import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

function AveragedChart({ averagedData }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [fromYear, setFromYear] = useState(null);
    const [toYear, setToYear] = useState(null);

    const renderChart = (filteredData) => {
        const ctx = chartRef.current.getContext('2d');

        const years = filteredData.map(entry => entry.year);
        const temperatures = filteredData.map(entry => entry.temperature);
        const precipitations = filteredData.map(entry => entry.precipitation);

        const { slope: tempSlope, trendLineData: tempTrendLineData } = calculateTrendLine(years, temperatures);
        const { slope: precSlope, trendLineData: precTrendLineData } = calculateTrendLine(years, precipitations);

        const data = {
            labels: years,
            datasets: [
                {
                    label: 'Average Temperature',
                    data: temperatures,
                    borderColor: 'red',
                    fill: false,
                    pointRadius: 6,
                    hidden: false, // Initially show temperature dataset
                },
                {
                    label: 'Temperature Trend Line',
                    data: tempTrendLineData,
                    borderColor: 'orange',
                    fill: false,
                    borderDash: [10, 5], // Add border dash for trend line
                    hidden: false, // Initially show temperature trend line
                },
                {
                    label: 'Average Precipitation',
                    data: precipitations,
                    borderColor: 'blue',
                    fill: false,
                    hidden: true, // Initially hide precipitation dataset
                },
                {
                    label: 'Precipitation Trend Line',
                    data: precTrendLineData,
                    borderColor: 'green',
                    fill: false,
                    borderDash: [10, 5], // Add border dash for trend line
                    hidden: true, // Initially hide precipitation trend line
                },
            ],
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Temperature Increase per year: ${tempSlope.toFixed(2)}°C`,
                    },
                    legend: {
                        onClick: (e, legendItem, legend) => {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            const datasets = ci.data.datasets;

                            // Toggle visibility of datasets
                            datasets.forEach((ds, i) => {
                                if (i === index || (i === index + 1 && index % 2 === 0)) {
                                    ds.hidden = !ds.hidden;
                                } else {
                                    ds.hidden = true;
                                }
                            });

                            // Update the title based on the visible dataset
                            const visibleDataset = datasets.find(ds => !ds.hidden && ds.label.includes('Average'));
                            let slope = 0;
                            let unit = '';

                            if (visibleDataset) {
                                if (visibleDataset.label.includes('Temperature')) {
                                    slope = tempSlope;
                                    unit = '°C';
                                } else if (visibleDataset.label.includes('Precipitation')) {
                                    slope = precSlope;
                                    unit = 'kg/m²';
                                }

                                ci.options.plugins.title.text = `${visibleDataset.label.split(' ')[1]} Increase per year: ${slope.toFixed(2)} ${unit}`;
                            } else {
                                ci.options.plugins.title.text = 'Averaged Data';
                            }

                            ci.update(); // Update chart
                        },
                    },
                },
                animation: {
                    tension: {
                        duration: 500,
                        easing: 'linear',
                        from: 1,
                        to: 0,
                        loop: true,
                    },
                },
                scales: {
                    x: {
                        type: 'category',
                    },
                    y: {
                        type: 'linear',
                    },
                },
            }, // <-- Add the missing comma here
        };

        // Destroy the previous chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create a new chart instance and store it in the ref
        chartInstance.current = new Chart(ctx, config);
    };

    const calculateTrendLine = (years, values) => {
        const dataPoints = years.map((year, index) => [year, values[index]]);
        const lr = linearRegression(dataPoints);
        const predict = linearRegressionLine(lr);

        const trendLineData = years.map(year => predict(year));
        return {
            slope: lr.m,
            trendLineData: trendLineData,
        };
    };

    const filterDataByYearRange = (data, from, to) => {
        if (!from || !to) {
            return data;
        }

        return data.filter(entry => entry.year >= from && entry.year <= to);
    };

    const handleDownloadChart = () => {
        if (chartInstance.current) {
            const link = document.createElement('a');
            link.href = chartInstance.current.toBase64Image();
            link.download = 'averaged_chart.png';
            link.click();
        }
    };

    useEffect(() => {
        if (averagedData) {
            const filteredData = filterDataByYearRange(averagedData, fromYear, toYear);
            renderChart(filteredData);
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [averagedData, fromYear, toYear]);

    const years = averagedData.map(entry => entry.year);
    const uniqueYears = [...new Set(years)];

    return (
        <>
            <canvas ref={chartRef}></canvas>
            <div className='flex justify-between'>

                <button className='flex justify-evenly underline text-red-400' onClick={handleDownloadChart}>Download Chart</button>
                <div className=''>
                    <label className=''>
                        From:
                        <select className=' bg-black' value={fromYear || ''} onChange={e => setFromYear(Number(e.target.value))}>
                            <option value=''>Select Year</option>
                            {uniqueYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        To:
                        <select className=' bg-black' value={toYear || ''} onChange={e => setToYear(Number(e.target.value))}>
                            <option value=''>Select Year</option>
                            {uniqueYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </>
    );
}

export default AveragedChart;
