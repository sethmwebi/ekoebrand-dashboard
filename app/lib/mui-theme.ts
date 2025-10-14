export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    "&, [class^=MuiDataGrid]": {
      borderColor: `${isDarkMode ? "#3d3d3d" : ""}`,
    },
    "& .MuiDataGrid-columnHeaders": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
      '& [role="row"] > *': {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
        borderColor: `${isDarkMode ? "#3d3d3d" : ""}`,
        borderRadius: "0",
      },
      "& .MuiDataGrid-sortIcon": {
        color: `${isDarkMode ? "#a3a3a3" : ""}`,
      },
      "& .MuiDataGrid-menuIconButton": {
        color: `${isDarkMode ? "#a3a3a3" : ""}`,
      },
      "& .MuiDataGrid-columnHeader:focus-within": {
        outline: "0.1px solid #ff6700",
      },
      "& .MuiDataGrid-columnSeparator": {
        color: "#f5f5f5",
      },
    },
    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
      outline: "none !important",
    },
    "& .MuiIconbutton-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
      backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
    },
    "& .MuiTablePagination-selectIcon": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiDataGrid-cell": {
      border: "none",
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
      backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
      "&:hover": {
        backgroundColor: `${isDarkMode ? "#3d3d3d" : ""}`, // Change this to your desired hover color
      },
    },
    // "& .MuiDataGrid-withBorderColor": {
    //   borderColor: `${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
    // },
    "& .css-h7cjts-MuiButtonBase-root-MuiIconButton-root.Mui-disabled": {
      color: `${isDarkMode ? "#3D3D3D !important" : ""}`,
    },

    "& .css-h7cjts-MuiButtonBase-root-MuiIconButton-root": {
      color: `${isDarkMode ? "#f5f5f5" : ""}`,
    },
  };
};
