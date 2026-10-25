import { useEffect, useMemo, useState } from "react";
import {
  applyEdgeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./matching.css";

const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 78;
const CANVAS_WIDTH = 690;

function MatchingNode({ data }) {
  const isRight = data.side === "right";

  return (
    <div className={`matching-node ${data.editable ? "matching-node-editable" : ""}`}>
      {!isRight && (
        <Handle
          type="source"
          position={Position.Right}
          id="match-source"
          isConnectable={data.connectable}
        />
      )}
      {isRight && (
        <Handle
          type="target"
          position={Position.Left}
          id="match-target"
          isConnectable={data.connectable}
        />
      )}
      <span className="matching-node-index">{data.index + 1}</span>
      {data.editable ? (
        <input
          aria-label={`${isRight ? "Right" : "Left"} matching item ${data.index + 1}`}
          className="matching-node-input nodrag"
          maxLength={120}
          onChange={(event) => data.onChange(data.index, event.target.value)}
          placeholder={`${isRight ? "Right" : "Left"} item ${data.index + 1}`}
          value={data.text}
        />
      ) : (
        <span className="matching-node-text">{data.text}</span>
      )}
    </div>
  );
}

const nodeTypes = { matchingItem: MatchingNode };

function makeEdge(sourceIndex, targetIndex, selectable = false) {
  return {
    id: `match-${sourceIndex}-${targetIndex}`,
    source: `left-${sourceIndex}`,
    sourceHandle: "match-source",
    target: `right-${targetIndex}`,
    targetHandle: "match-target",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "var(--primary-color)", strokeWidth: 2 },
    selectable,
  };
}

export default function MatchingFlow({
  pairs = [],
  mode = "preview",
  onPairsChange,
  onMappingChange,
}) {
  const [rightOrder] = useState(() => {
    const order = pairs.map((_, index) => index);
    if (mode === "answer") {
      for (let index = order.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
      }
    }
    return order;
  });
  const [answerEdges, setAnswerEdges] = useState([]);

  const nodes = useMemo(() => {
    const leftNodes = pairs.map((pair, index) => ({
      id: `left-${index}`,
      type: "matchingItem",
      position: { x: 10, y: 30 + index * ROW_HEIGHT },
      data: {
        index,
        side: "left",
        text: pair.left ?? pair.left_text ?? "",
        editable: mode === "edit",
        connectable: mode === "answer",
        onChange: (itemIndex, value) => onPairsChange?.(
          pairs.map((item, currentIndex) => currentIndex === itemIndex
            ? { ...item, left: value }
            : item)
        ),
      },
      draggable: false,
      connectable: mode === "answer",
    }));
    const rightNodes = (mode === "answer" ? rightOrder : pairs.map((_, index) => index))
      .map((pairIndex, rowIndex) => {
        const pair = pairs[pairIndex];
        return {
          id: `right-${pairIndex}`,
          type: "matchingItem",
          position: { x: CANVAS_WIDTH - COLUMN_WIDTH - 10, y: 30 + rowIndex * ROW_HEIGHT },
          data: {
            index: pairIndex,
            side: "right",
            text: pair.right ?? pair.right_text ?? "",
            editable: mode === "edit",
            connectable: mode === "answer",
            onChange: (itemIndex, value) => onPairsChange?.(
              pairs.map((item, currentIndex) => currentIndex === itemIndex
                ? { ...item, right: value }
                : item)
            ),
          },
          draggable: false,
          connectable: mode === "answer",
        };
      });

    return [...leftNodes, ...rightNodes];
  }, [mode, onPairsChange, pairs, rightOrder]);

  const displayEdges = useMemo(() => {
    if (mode === "answer") return answerEdges;
    return pairs.map((_, index) => makeEdge(index, index));
  }, [answerEdges, mode, pairs]);

  useEffect(() => {
    if (mode !== "answer") return;
    const mapping = Array(pairs.length).fill(null);
    answerEdges.forEach((edge) => {
      const leftIndex = Number(edge.source.slice("left-".length));
      const rightIndex = Number(edge.target.slice("right-".length));
      if (Number.isInteger(leftIndex) && Number.isInteger(rightIndex)) {
        mapping[leftIndex] = rightIndex;
      }
    });
    onMappingChange?.(mapping);
  }, [answerEdges, mode, onMappingChange, pairs.length]);

  const handleConnect = (connection) => {
    const sourceIndex = Number(connection.source?.slice("left-".length));
    const targetIndex = Number(connection.target?.slice("right-".length));
    if (
      !Number.isInteger(sourceIndex) ||
      !Number.isInteger(targetIndex) ||
      !connection.source?.startsWith("left-") ||
      !connection.target?.startsWith("right-")
    ) {
      return;
    }

    setAnswerEdges((currentEdges) => [
      ...currentEdges.filter((edge) => edge.source !== connection.source && edge.target !== connection.target),
      makeEdge(sourceIndex, targetIndex, true),
    ]);
  };

  if (mode === "edit") {
    return (
      <div className="matching-flow matching-flow-edit">
        <div className="matching-flow-headings" aria-hidden="true">
          <span>Left items</span>
          <span>Right items</span>
        </div>
        <p className="matching-flow-edit-help">
          Type the matching items into the fields below.
        </p>
        <div className="matching-editor-list">
          {pairs.map((pair, index) => (
            <div className="matching-editor-row" key={index}>
              <label className="matching-editor-field">
                <span>Left item {index + 1}</span>
                <input
                  aria-label={`Left matching item ${index + 1}`}
                  maxLength={120}
                  onChange={(event) => onPairsChange?.(
                    pairs.map((item, currentIndex) => currentIndex === index
                      ? { ...item, left: event.target.value }
                      : item)
                  )}
                  placeholder={`Enter left item ${index + 1}`}
                  value={pair.left ?? pair.left_text ?? ""}
                />
              </label>
              <span className="matching-editor-connector" aria-hidden="true">→</span>
              <label className="matching-editor-field">
                <span>Right item {index + 1}</span>
                <input
                  aria-label={`Right matching item ${index + 1}`}
                  maxLength={120}
                  onChange={(event) => onPairsChange?.(
                    pairs.map((item, currentIndex) => currentIndex === index
                      ? { ...item, right: event.target.value }
                      : item)
                  )}
                  placeholder={`Enter right item ${index + 1}`}
                  value={pair.right ?? pair.right_text ?? ""}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "answer" && pairs.length === 0) {
    return (
      <p className="matching-flow-empty" role="alert">
        Matching items could not be loaded. Please refresh the page or contact the post owner.
      </p>
    );
  }

  return (
    <div className={`matching-flow matching-flow-${mode}`}>
      <div className="matching-flow-headings" aria-hidden="true">
        <span>Left items</span>
        <span>Right items</span>
      </div>
      <div
        className="matching-flow-canvas"
        style={{
          height: `${Math.max(30 + (pairs.length - 1) * ROW_HEIGHT + 80, 276)}px`,
          minWidth: `${CANVAS_WIDTH}px`,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          onConnect={mode === "answer" ? handleConnect : undefined}
          onEdgesChange={mode === "answer" ? (changes) => {
            setAnswerEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
          } : undefined}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
          nodesDraggable={false}
          nodesConnectable={mode === "answer"}
          elementsSelectable={mode === "answer"}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          deleteKeyCode={mode === "answer" ? ["Backspace", "Delete"] : null}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--secondary-color)" gap={20} variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
      {mode === "answer" && (
        <p className="matching-flow-help">Connect every item on the left to a unique item on the right. Select a line and press Delete to change a match.</p>
      )}
    </div>
  );
}
