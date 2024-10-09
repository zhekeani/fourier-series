import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";

import { useEffect, useRef } from "react";

interface Props {
  ctrWidth: number;
  ctrHeight: number;
}

const createAxes = (ctrWidth: number, ctrHeight: number) => {
  const aspectRatio = ctrWidth / ctrHeight;

  const xInterval = aspectRatio > 1 ? aspectRatio : 1;
  const yInterval = aspectRatio < 1 ? 1 / aspectRatio : 1;

  const xTicksCount = aspectRatio > 1 ? aspectRatio * 5 : 5;
  const yTicksCount = aspectRatio < 1 ? (1 / aspectRatio) * 5 : 5;

  const xAxisScale = scaleLinear()
    .domain([-xInterval, xInterval])
    .range([0, ctrWidth]);
  const yAxisScale = scaleLinear()
    .domain([-yInterval, yInterval])
    .range([ctrHeight, 0]);

  const xAxis = axisBottom(xAxisScale).ticks(xTicksCount).tickSize(4);
  const yAxis = axisLeft(yAxisScale)
    .ticks(yTicksCount)
    .tickSize(4)
    .tickFormat((tick) => `${tick} i`);

  return {
    xAxis,
    yAxis,
    xTicksCount,
    yTicksCount,
  };
};

const Axes = ({ ctrWidth, ctrHeight }: Props) => {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const { xAxis, yAxis, xTicksCount, yTicksCount } = createAxes(
      ctrWidth,
      ctrHeight
    );

    if (xAxisRef.current) {
      const xAxisSelection = select(xAxisRef.current).call(xAxis);
      xAxisSelection.selectAll(".tick ").style("stroke", "transparent");
      xAxisSelection.selectAll(".domain").style("stroke", "#fff");

      const ticks = xAxisSelection
        .selectAll(".tick text")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("dy", "16px");

      ticks
        .filter(
          (_, i) => i < xTicksCount / 2 && i !== Math.round(xTicksCount / 2)
        )
        .attr("dx", "4px")
        .style("text-anchor", "start");

      ticks
        .filter(
          (_, i) => i > xTicksCount / 2 && i !== Math.round(xTicksCount / 2)
        )
        .attr("dx", "-4px")
        .style("text-anchor", "end");
    }

    if (yAxisRef.current) {
      const yAxisSelection = select(yAxisRef.current).call(yAxis);
      yAxisSelection.selectAll(".tick ").style("stroke", "transparent");
      yAxisSelection.selectAll(".domain").style("stroke", "#fff");

      const ticks = yAxisSelection
        .selectAll(".tick text")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("dx", "-6px");

      ticks
        .filter(
          (_, i) => i < yTicksCount / 2 && i !== Math.round(yTicksCount / 2)
        )
        .attr("dy", "-6px")
        .style("text-anchor", "end");

      ticks
        .filter(
          (_, i) => i > yTicksCount / 2 && i !== Math.round(yTicksCount / 2)
        )
        .attr("dy", "10px")
        .style("text-anchor", "end");
    }
  }, [ctrHeight, ctrWidth]);

  return (
    <g>
      <g ref={xAxisRef} transform={`translate(0, ${ctrHeight / 2})`} />

      <g ref={yAxisRef} transform={`translate(${ctrWidth / 2}, 0)`} />
    </g>
  );
};

export default Axes;
