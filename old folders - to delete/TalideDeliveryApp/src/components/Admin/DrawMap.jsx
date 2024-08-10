/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle, Line } from 'react-konva';
import './RoadMap.module.css';
import styles from './DrawMap.module.css';

const DrawMap = ({ size, onSave, onCancel}) => {
  const [nodes, setNodes] = useState([]);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [nodeMap, setNodeMap] = useState({});

  useEffect(() => {
    const newNodes = [];
    const newNodeMap = {};
    const offset = 50;
    let nodeId = 1;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const x = col * offset + offset;
        const y = row * offset + offset;
        newNodes.push({ id: nodeId, x, y });
        newNodeMap[`${x}-${y}`] = nodeId;
        nodeId++;
      }
    }
    setNodes(newNodes);
    setNodeMap(newNodeMap);
  }, [size]);

  const handleMouseDown = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();
    const nearestNode = findNearestNode(x, y);
    if (nearestNode) {
      setIsDrawing(true);
      setCurrentLine([nearestNode.x, nearestNode.y]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const { x, y } = e.target.getStage().getPointerPosition();
    const { x: startX, y: startY } = {
      x: currentLine[0],
      y: currentLine[1],
    };

    let newLine = [];
    if (Math.abs(startX - x) > Math.abs(startY - y)) {
      newLine = [startX, startY, x, startY];
    } else {
      newLine = [startX, startY, startX, y];
    }

    setCurrentLine(newLine);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    const { x, y } = e.target.getStage().getPointerPosition();
    const nearestNode = findNearestNode(x, y);
    if (nearestNode) {
      const { x: startX, y: startY } = {
        x: currentLine[0],
        y: currentLine[1],
      };

      let endX, endY;
      let direction = "";
      let reverseDirection = "";

      if (Math.abs(startX - nearestNode.x) > Math.abs(startY - nearestNode.y)) {
        endX = nearestNode.x;
        endY = startY;
        direction = startX < endX ? "east" : "west";
        reverseDirection = direction === "east" ? "west" : "east";
      } else {
        endX = startX;
        endY = nearestNode.y;
        direction = startY < endY ? "south" : "north";
        reverseDirection = direction === "south" ? "north" : "south";
      }

      const startNode = nodeMap[`${startX}-${startY}`];
      const endNode = nodeMap[`${endX}-${endY}`];

      const newLines = getIntermediateLines(startX, startY, endX, endY, startNode, endNode, direction, reverseDirection);

      setLines((prevLines) => [...prevLines, ...newLines]);
    }

    setIsDrawing(false);
    setCurrentLine([]);
  };

  const findNearestNode = (x, y) => {
    let nearestNode = null;
    let minDist = Infinity;
    nodes.forEach((node) => {
      const dist = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (dist < minDist && dist < 20) {
        minDist = dist;
        nearestNode = node;
      }
    });
    return nearestNode;
  };

  const getIntermediateLines = (startX, startY, endX, endY, startNode, endNode, direction, reverseDirection) => {
    const newLines = [];
    if (direction === "east" || direction === "west") {
      const step = direction === "east" ? 50 : -50;
      for (let x = startX + step; x !== endX + step; x += step) {
        const currentNode = nodeMap[`${x}-${startY}`];
        const prevNode = nodeMap[`${x - step}-${startY}`];
        newLines.push({ startNode: prevNode, endNode: currentNode, direction, reverseDirection });
      }
    } else if (direction === "south" || direction === "north") {
      const step = direction === "south" ? 50 : -50;
      for (let y = startY + step; y !== endY + step; y += step) {
        const currentNode = nodeMap[`${startX}-${y}`];
        const prevNode = nodeMap[`${startX}-${y - step}`];
        newLines.push({ startNode: prevNode, endNode: currentNode, direction, reverseDirection });
      }
    }
    return newLines;
  };

  const handleSave = () => {
    const graph = nodes.map((node) => {
      const nodeEdges = lines
        .filter(line => line.startNode === node.id || line.endNode === node.id)
        .map(line => {
          if (line.startNode === node.id) {
            return {
              vertex: line.endNode,
              direction: line.direction
            };
          } else {
            return {
              vertex: line.startNode,
              direction: line.reverseDirection
            };
          }
        });
      return {
        id: node.id,
        edges: nodeEdges
      };
    });

    onSave(graph);
  };

  return (
    <div className="roadmap-container">
      <Stage
        width={size * 50 + 50}
        height={size * 50 + 50}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {nodes.map((node) => (
            <Circle key={node.id} x={node.x} y={node.y} radius={10} fill="black" />
          ))}
          {lines.map((line, index) => (
            <Line
              key={index}
              points={[
                nodes.find(n => n.id === line.startNode).x,
                nodes.find(n => n.id === line.startNode).y,
                nodes.find(n => n.id === line.endNode).x,
                nodes.find(n => n.id === line.endNode).y
              ]}
              stroke="black"
              strokeWidth={2}
            />
          ))}
          {isDrawing && <Line points={currentLine} stroke="black" strokeWidth={2} />}
        </Layer>
      </Stage>
      <div className= {styles.buttonContainer}>
        <button onClick={handleSave} className = {styles.choiceButton}>Save Map</button>
        <button onClick={onCancel} className={styles.choiceButton}>Cancel</button>
        </div>
      
    </div>
  );
};

DrawMap.propTypes = {
  size: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DrawMap;