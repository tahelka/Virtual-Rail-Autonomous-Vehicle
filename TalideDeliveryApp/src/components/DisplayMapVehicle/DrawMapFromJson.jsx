/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle, Line } from 'react-konva';
import '../Admin/RoadMap.module.css';
import styles from '../Admin/DrawMap.module.css';

const DrawMapFromJson = ({ jsonData, onCancel }) => {
  const [nodes, setNodes] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (jsonData) {
      const parsedData = JSON.parse(jsonData);
      const newNodes = [];
      const newLines = [];

      // Assuming the number of nodes is a perfect square (e.g., 64)
      const gridSize = Math.sqrt(parsedData.length);

      parsedData.forEach((node, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const x = col * 50 + 50; // Adjust node spacing and position as needed
        const y = row * 50 + 50; // Adjust node spacing and position as needed
        newNodes.push({ id: node.id, x, y });

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
    }
  }, [jsonData]);

  return (
    <div className="roadmap-container">
      <Stage width={500} height={500}>
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
        </Layer>
      </Stage>
      <div className={styles.buttonContainer}>
        
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
