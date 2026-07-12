import type { CSSProperties } from "react";

type PickerLoadingSkeletonProps = {
  columns?: number;
  rows?: number;
  sections?: number;
};

export function PickerLoadingSkeleton({
  columns = 9,
  rows = 6,
  sections = 3,
}: PickerLoadingSkeletonProps) {
  const sectionCount = Math.max(1, Math.min(sections, rows));
  const baseRowsPerSection = Math.floor(rows / sectionCount);
  const extraRows = rows % sectionCount;

  return (
    <div
      aria-hidden
      className="picker-loading-skeleton"
      style={{ "--picker-loading-columns": columns } as CSSProperties}
    >
      {Array.from({ length: sectionCount }, (_, sectionIndex) => {
        const rowCount =
          baseRowsPerSection + (sectionIndex < extraRows ? 1 : 0);

        return (
          <div className="picker-loading-section" key={sectionIndex}>
            <div className="picker-loading-header">
              <span
                className="picker-loading-header-pill"
                style={{ width: `${Math.max(5, 9 - sectionIndex)}ch` }}
              />
            </div>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <div className="picker-loading-row" key={`${sectionIndex}:${rowIndex}`}>
                {Array.from({ length: columns }, (_, columnIndex) => (
                  <div className="picker-loading-cell" key={columnIndex}>
                    <span className="picker-loading-emoji" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
