import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StatusCard } from "../../components/StatusCard";

// Mock usePressSpring
jest.mock("../../hooks/usePressSpring", () => ({
  usePressSpring: () => ({
    animStyle: {},
    handlers: { onPressIn: jest.fn(), onPressOut: jest.fn() },
  }),
}));

// Mock SVG icon components
jest.mock("../../components/icons/BottleIcon", () => ({
  BottleIcon: () => null,
}));
jest.mock("../../components/icons/MoonIcon", () => ({
  MoonIcon: () => null,
}));
jest.mock("../../components/icons/DiaperIcon", () => ({
  DiaperIcon: () => null,
}));

describe("StatusCard", () => {
  const defaultProps = {
    type: "feed" as const,
    label: "Last Fed",
    value: "43 min ago",
    onPress: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onPress.mockClear();
  });

  it("renders label and value text", () => {
    const { getByText } = render(<StatusCard {...defaultProps} />);
    expect(getByText("Last Fed")).toBeTruthy();
    expect(getByText("43 min ago")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const { getByText } = render(<StatusCard {...defaultProps} />);
    fireEvent.press(getByText("Last Fed"));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it("renders with different values", () => {
    const { getByText } = render(
      <StatusCard
        type="sleep"
        label="Last Sleep"
        value="Sleeping"
        onPress={jest.fn()}
      />
    );
    expect(getByText("Last Sleep")).toBeTruthy();
    expect(getByText("Sleeping")).toBeTruthy();
  });

  it("renders 'No data' fallback", () => {
    const { getByText } = render(
      <StatusCard {...defaultProps} value="No data" />
    );
    expect(getByText("No data")).toBeTruthy();
  });
});
