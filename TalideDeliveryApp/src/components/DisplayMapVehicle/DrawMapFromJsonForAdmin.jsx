/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import DrawMapFromJson from './DrawMapFromJson';

const DrawMapFromJsonForAdmin = ({ jsonData, onCancel }) => {
  return (
    <DrawMapFromJson
      jsonData={jsonData}
      isEditable={true}
      onSave={() => { console.log('Save clicked'); }}
      onCancel={onCancel}
    />
  );
};

DrawMapFromJsonForAdmin.propTypes = {
  jsonData: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DrawMapFromJsonForAdmin;
