"use client";
import { useRef, useLayoutEffect } from "react";
import Editor from "@/Editor/Editor";
import useStore from "@/store/store.index";
import Loading from "@/shared/Loading";

export default function EditorUi() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isLoadingOver = useStore.use.isLoadingOver();

    useLayoutEffect(() => {
        async function startGame() {
            if (!canvasRef.current) return;
            const editor = Editor.GetInstance();
            try {
                await editor.init(canvasRef.current);
            } catch (error) {
                Editor.ClearInstance();
                console.error(error)
            }
        }
        void startGame();

        return () => Editor.ClearInstance();
    }, []);

    return (
        <main className="z-10 h-screen min-h-screen w-full select-none">
            <div
                id="canvas-container"
                className="max-h-screen overflow-hidden opacity-100"
            >
                <canvas
                    id="canvas"
                    ref={canvasRef}
                    className="h-screen w-full outline-none"
                    style={{ transition: "transform 0.1s linear" }}
                />
                {isLoadingOver ? (
                    <>
                        {/* EDITOR UI HERE */}
                    </>
                ) : (
                    <Loading />
                )}
            </div>
        </main>
    );
}
