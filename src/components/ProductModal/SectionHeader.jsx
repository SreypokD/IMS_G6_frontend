import React from "react";
import PropTypes from "prop-types";

const SectionHeader = ({ icon: Icon, title }) => {
  return (
    <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
      <Icon className="inline-block text-xl text-black" />
      <span>{title}</span>
    </h3>
  );
};

SectionHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
};

export default SectionHeader;
