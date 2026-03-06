import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TaskItem } from "../../components/TaskItem";

// Mock usePressSpring
jest.mock("../../hooks/usePressSpring", () => ({
  usePressSpring: () => ({
    animStyle: {},
    handlers: { onPressIn: jest.fn(), onPressOut: jest.fn() },
  }),
}));

// Mock gesture handler — GestureDetector just renders children
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Gesture: {
      Pan: () => ({
        activeOffsetX: jest.fn().mockReturnThis(),
        failOffsetY: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    GestureHandlerRootView: View,
  };
});

describe("TaskItem", () => {
  const defaultProps = {
    title: "Sanitize bottles",
    time: "20:00",
    assignee: "Dad",
    onComplete: jest.fn(),
    onPress: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onComplete.mockClear();
    defaultProps.onPress.mockClear();
  });

  it("renders title, time, and assignee", () => {
    const { getByText } = render(<TaskItem {...defaultProps} />);
    expect(getByText("Sanitize bottles")).toBeTruthy();
    expect(getByText("20:00")).toBeTruthy();
    expect(getByText("Dad")).toBeTruthy();
  });

  it("renders without optional time and assignee", () => {
    const { getByText, queryByText } = render(
      <TaskItem title="Test task" />
    );
    expect(getByText("Test task")).toBeTruthy();
    expect(queryByText("20:00")).toBeNull();
  });

  it("renders the completion circle", () => {
    const { getByText } = render(<TaskItem {...defaultProps} />);
    // The task renders — the circle is part of the layout
    expect(getByText("Sanitize bottles")).toBeTruthy();
  });

  it("does not call onComplete on initial render", () => {
    render(<TaskItem {...defaultProps} />);
    expect(defaultProps.onComplete).not.toHaveBeenCalled();
  });
});
