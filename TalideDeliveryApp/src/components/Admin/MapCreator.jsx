/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Stage, Layer, Circle, Line } from 'react-konva';
import './RoadMap.css';

const DrawMap = ({ size, onSave }) => {
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
      if (Math.abs(startX - nearestNode.x) > Math.abs(startY - nearestNode.y)) {
        endX = nearestNode.x;
        endY = startY;
      } else {
        endX = startX;
        endY = nearestNode.y;
      }

      const startNode = nodeMap[`${startX}-${startY}`];
      const endNode = nodeMap[`${endX}-${endY}`];

      let intermediateNodes = [];
      if (startX === endX) {
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        for (let y = minY; y <= maxY; y += 50) {
          intermediateNodes.push(nodeMap[`${startX}-${y}`]);
        }
      } else if (startY === endY) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        for (let x = minX; x <= maxX; x += 50) {
          intermediateNodes.push(nodeMap[`${x}-${startY}`]);
        }
      }

      for (let i = 0; i < intermediateNodes.length - 1; i++) {
        setLines((prevLines) => [
          ...prevLines,
          [
            nodes[intermediateNodes[i] - 1].x,
            nodes[intermediateNodes[i] - 1].y,
            nodes[intermediateNodes[i + 1] - 1].x,
            nodes[intermediateNodes[i + 1] - 1].y,
          ],
        ]);
      }
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

  const handleSave = () => {
    const adjacencyList = {};

    nodes.forEach((node) => {
      adjacencyList[node.id] = [];
    });

    lines.forEach((line) => {
      const [x1, y1, x2, y2] = line;
      const node1 = nodeMap[`${x1}-${y1}`];
      const node2 = nodeMap[`${x2}-${y2}`];

      if (!adjacencyList[node1].includes(node2)) {
        adjacencyList[node1].push(node2);
      }
      if (!adjacencyList[node2].includes(node1)) {
        adjacencyList[node2].push(node1);
      }
    });

    onSave(adjacencyList);
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
            <Line key={index} points={line} stroke="black" strokeWidth={2} />
          ))}
          {isDrawing && <Line points={currentLine} stroke="black" strokeWidth={2} />}
        </Layer>
      </Stage>
      <button onClick={handleSave} className="save-button">Save Map</button>
    </div>
  );
};

DrawMap.propTypes = {
  size: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
};

const MapCreator = ({ addNewMap }) => {
  const [gridSize, setGridSize] = useState(0);
  const [mapGridSize, setMapGridSize] = useState(null);
  const [error, setError] = useState(null);

  const handleGridSizeChange = (event) => {
    setGridSize(Number(event.target.value));
  };

  const handleSetGridSize = () => {
    setMapGridSize(gridSize);
  };

  const handleSaveMap = (adjacencyList) => {
    try {
      const json = JSON.stringify(adjacencyList, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'map.json';
      link.click();
      URL.revokeObjectURL(url);
      addNewMap(adjacencyList);
      setMapGridSize(null);
      setError(null);
    } catch (error) {
      console.error('Error saving map:', error);
      setError('Failed to save map');
    }
  };

  return (
    <div>
      {mapGridSize === null ? (
        <div>
          <label>
            Grid Size:
            <input type="number" value={gridSize} onChange={handleGridSizeChange} />
          </label>
          <button onClick={handleSetGridSize}>Set Grid Size</button>
        </div>
      ) : (
        <DrawMap size={mapGridSize} onSave={handleSaveMap} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

MapCreator.propTypes = {
  addNewMap: PropTypes.func.isRequired,
};

export default MapCreator;