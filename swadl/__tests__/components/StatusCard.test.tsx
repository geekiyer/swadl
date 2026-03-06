import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StatusCard } from "../../components/StatusCard";
import { Baby } from "lucide-react-native";
import { colors } from "../../constants/theme";

// Mock usePressSpring
jest.mock("../../hooks/usePressSpring", () => ({
  usePressSpring: () => ({
    animStyle: {},
    handlers: { onPressIn: jest.fn(), onPressOut: jest.fn() },
  }),
}));

describe("StatusCard", () => {
  const defaultProps = {
    icon: Baby,
    iconBgColor: "rgba(245, 158, 11, 0.15)",
    iconColor: colors.amber,
    label: "Last Fed",
    value: "bottle",
    timeAgo: "43 min ago",
    onPress: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onPress.mockClear();
  });

  it("renders label, value, and timeAgo text", () => {
    const { getByText } = render(<StatusCard {...defaultProps} />);
    expect(getByText("Last Fed")).toBeTruthy();
    expect(getByText("bottle")).toBeTruthy();
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
        {...defaultProps}
        label="Last Sleep"
        value="Sleeping"
        timeAgo="2h ago"
      />
    );
    expect(getByText("Last Sleep")).toBeTruthy();
    expect(getByText("Sleeping")).toBeTruthy();
    expect(getByText("2h ago")).toBeTruthy();
  });

  it("renders 'No data' fallback", () => {
    const { getAllByText } = render(
      <StatusCard {...defaultProps} value="No data" timeAgo="No data" />
    );
    // Both value and timeAgo show "No data"
    expect(getAllByText("No data")).toHaveLength(2);
  });
});
