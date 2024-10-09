import { PathShapeNames, pathsShapes } from "./paths/pathsShapes";

interface Props {
  activePath: PathShapeNames;
}

const OriPathPreview = ({ activePath }: Props) => {
  const pathShape = pathsShapes.filter(
    (pathShape) => pathShape.name === activePath
  )[0];

  return <pathShape.component />;
};

export default OriPathPreview;
