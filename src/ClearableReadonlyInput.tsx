interface Props {
  value: string;
  onClearClick: () => void;
}
const ClearableReadonlyTextBox = (props: Props) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        {props.value || "Empty"}
        <button
          onClick={props.onClearClick}
          style={{ marginLeft: "8px", borderStyle: "none", cursor: "pointer" }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ClearableReadonlyTextBox;
