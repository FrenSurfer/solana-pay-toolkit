import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QRDisplay } from "./QRDisplay";

describe("QRDisplay", () => {
  const mockProps = {
    qrBase64:
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    url: "solana:test?amount=1",
  };

  beforeEach(() => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders QR code image", () => {
    render(<QRDisplay {...mockProps} />);
    expect(
      screen.getByAltText("Solana Pay QR Code")
    ).toBeInTheDocument();
  });

  it("copies URL to clipboard when Copy URL is clicked", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: mockWriteText },
    });

    render(<QRDisplay {...mockProps} />);
    fireEvent.click(screen.getByText("Copy URL"));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockProps.url);
    });
  });
});
