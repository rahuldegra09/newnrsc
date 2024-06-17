import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

function ChartComponent({ fetchedData }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [fromYear, setFromYear] = useState(null);
    const [toYear, setToYear] = useState(null);

    const renderChart = (filteredData) => {
        const ctx = chartRef.current.getContext('2d');

        const years = filteredData.map(entry => entry.data.map(tempEntry => tempEntry.year)).flat();
        const temperatures = filteredData.map(entry => entry.data.map(tempEntry => tempEntry.temperature)).flat();
        const precipitations = filteredData.map(entry => entry.data.map(tempEntry => tempEntry.precipitation)).flat();

        const { slope: tempSlope, trendLineData: tempTrendLineData } = calculateTrendLine(years, temperatures);
        const { slope: precSlope, trendLineData: precTrendLineData } = calculateTrendLine(years, precipitations);

        const data = {
            labels: years,
            datasets: [
                {
                    label: 'Temperature data',
                    data: temperatures,
                    borderColor: 'red',
                    fill: false,
                    pointRadius: 6,
                    hidden: false,
                },
                {
                    label: 'Temperature Trend line',
                    data: tempTrendLineData,
                    borderColor: 'blue',
                    fill: false,
                    pointRadius: 0,
                    borderDash: [10, 3],
                    hidden: false,
                },
                {
                    label: 'Precipitation data',
                    data: precipitations,
                    borderColor: 'green',
                    fill: false,
                    pointRadius: 7,
                    hidden: true,
                },
                {
                    label: 'Precipitation Trend line',
                    data: precTrendLineData,
                    borderColor: 'purple',
                    fill: false,
                    pointRadius: 0,
                    borderDash: [10, 3],
                    hidden: true,
                },
            ],
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        onClick: (e, legendItem, legend) => {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            const datasets = ci.data.datasets;

                            const currentDataset = datasets[index];
                            if (!currentDataset) return;

                            datasets.forEach((ds, i) => {
                                if (i === index || i === index + 1) {
                                    ds.hidden = !ds.hidden;
                                } else {
                                    ds.hidden = true;
                                }
                            });

                            // Update the title based on the visible dataset
                            const visibleDataset = datasets.find(ds => !ds.hidden && ds.label.includes('data'));
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

                                ci.options.plugins.title.text = `Climate Data (${visibleDataset.label.includes('Temperature') ? 'Temperature' : 'Precipitation'} Increase per year: ${slope.toFixed(2)} ${unit})`;
                            } else {
                                ci.options.plugins.title.text = 'Climate Data';
                            }

                            ci.update();
                        },
                    },
                    title: {
                        display: true,
                        text: `Climate Data (Temperature Increase per year: ${tempSlope.toFixed(2)}°C)`,
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
            },
        };

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, config);
    };

    const calculateTrendLine = (years, values) => {
        const dataPoints = years.map((year, index) => [year, values[index]]);
        const lr = linearRegression(dataPoints);
        const predict = linearRegressionLine(lr);

        const trendLineData = years.map(year => predict(year));
        return {
            slope: lr.m,
            intercept: lr.b,
            trendLineData: trendLineData,
        };
    };

    const filterDataByYearRange = (data, from, to) => {
        if (!from || !to) {
            return data;
        }

        return data.map(entry => ({
            ...entry,
            data: entry.data.filter(tempEntry => tempEntry.year >= from && tempEntry.year <= to),
        }));
    };

    const handleDownloadChart = () => {
        if (chartInstance.current) {
            const link = document.createElement('a');
            link.href = chartInstance.current.toBase64Image();
            link.download = 'chart.png';
            link.click();
        }
    };

    useEffect(() => {
        if (fetchedData) {
            const filteredData = filterDataByYearRange(fetchedData, fromYear, toYear);
            renderChart(filteredData);
        }

        return () => {
            if (chartRef.current && chartRef.current.chart) {
                chartRef.current.chart.destroy();
            }
        };
    }, [fetchedData, fromYear, toYear]);

    const years = fetchedData.map(entry => entry.data.map(tempEntry => tempEntry.year)).flat();
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

export default ChartComponent;
