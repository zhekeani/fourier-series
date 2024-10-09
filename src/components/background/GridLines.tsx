import { scaleLinear, ScaleLinear } from "d3-scale";
import { select, Selection } from "d3-selection";
import { useEffect, useRef } from "react";

interface Props {
  ctrWidth: number;
  ctrHeigh: number;
}

const useGridLines = (ctrWidth: number, ctrHeight: number) => {
  const aspectRatio = ctrWidth / ctrHeight;

  const n = 8;

  let xTicksCount = {
    major: n,
    minor: n * 5,
  };
  let yTicksCount = {
    major: n,
    minor: n * 5,
  };

  if (aspectRatio > 1) {
    xTicksCount = {
      major: Math.max(n, Math.round(n * aspectRatio)),
      minor: Math.max(n * 5, Math.round(n * 5 * aspectRatio)),
    };
  } else {
    yTicksCount = {
      major: Math.max(n, Math.round(n / aspectRatio)),
      minor: Math.max(n * 5, Math.round((n * 5) / aspectRatio)),
    };
  }

  const xGridScale = {
    scale: scaleLinear()
      .domain([-xTicksCount.minor / 2, xTicksCount.minor / 2])
      .range([0, ctrWidth]),
    ticks: xTicksCount,
  };

  const yGridScale = {
    scale: scaleLinear()
      .domain([-yTicksCount.minor / 2, yTicksCount.minor / 2])
      .range([ctrHeight, 0]),
    ticks: yTicksCount,
  };

  const gridColor = "#62aeba";

  return {
    xGridScale,
    yGridScale,
    gridColor,
  };
};

const renderGridLines = (
  selection: Selection<SVGGElement, unknown, null, undefined>,
  scale: ScaleLinear<number, number>,
  ticksCount: { major: number; minor: number },
  orientation: "horizontal" | "vertical",
  length: number,
  gridColor: string
) => {
  const ticks = scale.ticks(ticksCount.minor);

  const lines = selection.selectAll<SVGLineElement, number>("line").data(ticks);

  lines.exit().remove();

  lines
    .enter()
    .append<SVGLineElement>("line")
    .merge(lines)
    .attr(orientation === "horizontal" ? "x1" : "y1", 0)
    .attr(orientation === "horizontal" ? "x2" : "y2", length)
    .attr(orientation === "horizontal" ? "y1" : "x1", scale)
    .attr(orientation === "horizontal" ? "y2" : "x2", scale)
    .style("stroke", gridColor)
    .style("stroke-width", (d) => {
      return scale.ticks(ticksCount.major).includes(d) ? "0.6" : "0.5";
    })
    .style("opacity", (d) => {
      return scale.ticks(ticksCount.major).includes(d) ? 0.8 : 0.5;
    });
};

const GridLines = ({ ctrHeigh, ctrWidth }: Props) => {
  const gridRef = useRef<SVGGElement | null>(null);

  const { xGridScale, yGridScale, gridColor } = useGridLines(
    ctrWidth,
    ctrHeigh
  );

  useEffect(() => {
    if (gridRef.current) {
      const gridGroup = select<SVGGElement, unknown>(gridRef.current);

      const xGridGroup = gridGroup
        .selectAll<SVGGElement, unknown>(".x-grid")
        .data([null]);
      xGridGroup
        .enter()
        .append<SVGGElement>("g")
        .attr("class", "x-grid")
        .merge(xGridGroup)
        .call((g) =>
          renderGridLines(
            g as unknown as Selection<SVGGElement, unknown, null, undefined>,
            xGridScale.scale,
            xGridScale.ticks,
            "vertical",
            ctrHeigh,
            gridColor
          )
        );

      const yGridGroup = gridGroup
        .selectAll<SVGGElement, unknown>(".y-grid")
        .data([null]);
      yGridGroup
        .enter()
        .append<SVGGElement>("g")
        .attr("class", "y-grid")
        .merge(yGridGroup)
        .call((g) =>
          renderGridLines(
            g as unknown as Selection<SVGGElement, unknown, null, undefined>,
            yGridScale.scale,
            yGridScale.ticks,
            "horizontal",
            ctrWidth,
            gridColor
          )
        );
    }
  }, [ctrHeigh, ctrWidth, gridColor, xGridScale, yGridScale]);

  return <g ref={gridRef}></g>;
};

export default GridLines;
