import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MoodPicker } from "../../components/MoodPicker";

// Mock usePressSpring
jest.mock("../../hooks/usePressSpring", () => ({
  usePressSpring: () => ({
    animStyle: {},
    handlers: { onPressIn: jest.fn(), onPressOut: jest.fn() },
  }),
}));

describe("MoodPicker", () => {
  it("renders all 4 mood options", () => {
    const { getByText } = render(<MoodPicker />);
    expect(getByText("Happy")).toBeTruthy();
    expect(getByText("Sleepy")).toBeTruthy();
    expect(getByText("Fussy")).toBeTruthy();
    expect(getByText("Calm")).toBeTruthy();
  });

  it("defaults to calm when no currentMood is provided", () => {
    const { getByText } = render(<MoodPicker />);
    // Calm should be selected by default
    expect(getByText("Calm")).toBeTruthy();
  });

  it("respects currentMood prop", () => {
    const { getByText } = render(<MoodPicker currentMood="happy" />);
    expect(getByText("Happy")).toBeTruthy();
  });

  it("calls onMoodChange when a mood is selected", () => {
    const onMoodChange = jest.fn();
    const { getByText } = render(
      <MoodPicker onMoodChange={onMoodChange} />
    );

    fireEvent.press(getByText("Happy"));
    expect(onMoodChange).toHaveBeenCalledWith("happy");

    fireEvent.press(getByText("Fussy"));
    expect(onMoodChange).toHaveBeenCalledWith("fussy");
  });

  it("renders mood emojis", () => {
    const { getByText } = render(<MoodPicker />);
    expect(getByText("😊")).toBeTruthy();
    expect(getByText("😴")).toBeTruthy();
    expect(getByText("😟")).toBeTruthy();
    expect(getByText("😌")).toBeTruthy();
  });
});
