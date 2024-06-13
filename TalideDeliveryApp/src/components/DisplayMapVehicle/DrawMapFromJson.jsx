// DrawMapFromJson.js
/* eslint-disable no-unused-vars */
// DrawMapFromJson.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle, Line } from 'react-konva';
import '../Admin/RoadMap.module.css';
import styles from '../Admin/DrawMap.module.css';

const DrawMapFromJson = ({ jsonData, onCancel }) => {
  const [nodes, setNodes] = useState([]);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [nodeMap, setNodeMap] = useState({});

  useEffect(() => {
    if (jsonData) {
      const parsedData = JSON.parse(jsonData);
      const newNodes = [];
      const newLines = [];
      const newNodeMap = {};

      // Assuming the number of nodes is a perfect square (e.g., 64)
      const gridSize = Math.sqrt(parsedData.length);
      const offset = 50;

      parsedData.forEach((node, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const x = col * offset + offset; // Adjust node spacing and position as needed
        const y = row * offset + offset; // Adjust node spacing and position as needed
        newNodes.push({ id: node.id, x, y });
        newNodeMap[`${x}-${y}`] = node.id;

        node.edges.forEach(edge => {
          const startNode = node.id;
          const endNode = edge.vertex;
          const direction = edge.direction;
          const reverseDirection = direction === 'north' ? 'south' : direction === 'south' ? 'north' : direction === 'east' ? 'west' : 'east';

          newLines.push({ startNode, endNode, direction, reverseDirection });
        });
      });

      setNodes(newNodes);
      setLines(newLines);
      setNodeMap(newNodeMap);
    }
  }, [jsonData]);

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

  const handleSave = async () => {
    const updatedNodes = nodes.map(node => {
      const nodeLines = lines.filter(line => line.startNode === node.id);
      const edges = nodeLines.map(line => ({
        vertex: line.endNode,
        direction: line.direction,
      }));
      return { id: node.id, edges };
    });

    const updatedJsonData = JSON.stringify(updatedNodes, null, 2);

    try {
      const response = await fetch('/api/save-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updatedJsonData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save the map');
      }

      alert('Map saved successfully');
    } catch (error) {
      console.error('Error saving map:', error);
      alert('Error saving map');
    }
  };

  return (
    <div className="roadmap-container">
      <Stage
        width={500}
        height={500}
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
      <div className={styles.buttonContainer}>
        <button onClick={handleSave} className={styles.choiceButton}>Save</button>
        <button onClick={onCancel} className={styles.choiceButton}>Cancel</button>
      </div>
    </div>
  );
};

DrawMapFromJson.propTypes = {
  jsonData: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DrawMapFromJson;
