// Test the timeAgo helper used in Dashboard and ActivityFeed

function timeAgo(dateStr: string | undefined | null): string {
  if (!dateStr) return "No data";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

describe("timeAgo", () => {
  it("returns 'No data' for null/undefined", () => {
    expect(timeAgo(null)).toBe("No data");
    expect(timeAgo(undefined)).toBe("No data");
  });

  it("returns 'Just now' for recent timestamps", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("Just now");
  });

  it("returns minutes for < 60 minutes", () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60000).toISOString();
    expect(timeAgo(thirtyMinsAgo)).toBe("30 min ago");
  });

  it("returns hours for < 24 hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days for >= 24 hours", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("2d ago");
  });

  it("returns 1 min ago for 1 minute", () => {
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    expect(timeAgo(oneMinAgo)).toBe("1 min ago");
  });

  it("returns 1h ago for 1 hour", () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    expect(timeAgo(oneHourAgo)).toBe("1h ago");
  });
});

describe("timeLabel (ActivityFeed variant)", () => {
  it("returns 'Just now' for recent timestamps", () => {
    expect(timeLabel(new Date().toISOString())).toBe("Just now");
  });

  it("uses 'm ago' shorthand (not 'min ago')", () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeLabel(fiveMinsAgo)).toBe("5m ago");
  });

  it("returns hours for < 24 hours", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(timeLabel(twoHoursAgo)).toBe("2h ago");
  });
});
