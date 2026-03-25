"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import mermaid from "mermaid";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

interface UMLViewerProps {
  diagram: string;
}

export interface UMLViewerRef {
  zoomIn: () => void;
  zoomOut: () => void;
  download: (format: "png" | "jpeg" | "pdf") => void;
}

export const UMLViewer = forwardRef<UMLViewerRef, UMLViewerProps>(({ diagram }, ref) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      // react-zoom-pan-pinch zoomIn
      transformRef.current?.zoomIn(0.2);
    },
    zoomOut: () => {
      transformRef.current?.zoomOut(0.2);
    },
    download: async (format: "png" | "jpeg" | "pdf") => {
      if (!diagramRef.current) return;
      const element = diagramRef.current;
      
      try {
        const createFileName = (ext: string) => `diagram-${new Date().toISOString().slice(0,10)}.${ext}`;
        const isDark = document.documentElement.classList.contains("dark");
        const bg = isDark ? "#0f172a" : "#ffffff"; 

        const options = { backgroundColor: bg, pixelRatio: 2, style: { transform: "none" } };

        if (format === "png") {
          const dataUrl = await toPng(element, options);
          const link = document.createElement("a");
          link.download = createFileName("png");
          link.href = dataUrl;
          link.click();
        } else if (format === "jpeg") {
          const dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
          const link = document.createElement("a");
          link.download = createFileName("jpeg");
          link.href = dataUrl;
          link.click();
        } else if (format === "pdf") {
          const dataUrl = await toPng(element, options);
          const pdf = new jsPDF({
            orientation: element.offsetWidth > element.offsetHeight ? "landscape" : "portrait",
            unit: "px",
            format: [element.offsetWidth, element.offsetHeight]
          });
          pdf.addImage(dataUrl, "PNG", 0, 0, element.offsetWidth, element.offsetHeight);
          pdf.save(createFileName("pdf"));
        }
      } catch (err) {
        console.error("Failed to download image:", err);
      }
    }
  }));

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark", 
      securityLevel: "loose",
    });

    const renderDiagram = async () => {
      if (diagram) {
        try {
          const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, diagram);
          setSvgContent(svg);
        } catch (error) {
          console.error("Mermaid error:", error);
          setSvgContent(`<div class="text-destructive h-full w-full flex items-center justify-center p-4 text-center">
            Failed to render diagram.<br/>Please ensure the codebase has valid syntax.
          </div>`);
        }
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-background flex flex-col">
      <div className="flex-1 relative">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.1}
          maxScale={8}
          centerOnInit
          limitToBounds={false}
          wheel={{ step: 0.1 }}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {svgContent ? (
              <div
                ref={diagramRef}
                className="mermaid-wrapper w-full h-full flex flex-col items-center justify-center [&>svg]:max-w-none [&>svg]:w-auto [&>svg]:h-auto px-12 py-12"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="text-muted-foreground animate-pulse">Rendering Diagram...</div>
            )}
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
});