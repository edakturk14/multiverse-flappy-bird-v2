"use client";
import React, { useEffect, useRef, useState } from 'react';

export function startGame(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    setGameStarted: React.Dispatch<React.SetStateAction<boolean>>,
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    gameOverRef: React.MutableRefObject<boolean>,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    level: string
) {
    startGameLogic(canvasRef, setGameStarted, setGameOver, gameOverRef, setScore, level);
}

function startGameLogic(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    setGameStarted: React.Dispatch<React.SetStateAction<boolean>>,
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    gameOverRef: React.MutableRefObject<boolean>,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    level: string
) {
    const canvas = canvasRef.current;
    if (canvas) {
        const context = canvas.getContext("2d");
        if (!context) return;

        const boardWidth = 2000;
        const boardHeight = 800;

        // bird
        const birdWidth = 34;
        const birdHeight = 24;
        const birdX = boardWidth / 8;
        const birdY = boardHeight / 2;

        const bird = {
            x: birdX,
            y: birdY,
            width: birdWidth,
            height: birdHeight,
        };

        // pipes
        let pipeArray: any[] = [];
        const pipeWidth = 64;
        const pipeHeight = 512;
        const pipeX = boardWidth;
        const pipeY = 0;

        const birdImg = new Image();
        birdImg.src = "/images/flappybird.png";

        const topPipeImg = new Image();
        topPipeImg.src = "/images/toppipe.png";

        const bottomPipeImg = new Image();
        bottomPipeImg.src = "/images/bottompipe.png";

        const bgImg = new Image();
        bgImg.src = "/images/flappy-bird-bg.png";

        // Set velocity based on level
        let velocityX;
        switch (level) {
            case "beginner":
                velocityX = -3;
                break;
            case "intermediate":
                velocityX = -5;
                break;
            case "expert":
                velocityX = -7;
                break;
            default:
                velocityX = -3;
        }

        let velocityY = 0;
        const gravity = 0.3;

        let score = 0;

        const detectCollision = (bird: any, pipe: any) => {
            return (
                bird.x < pipe.x + pipe.width &&
                bird.x + bird.width > pipe.x &&
                bird.y < pipe.y + pipe.height &&
                bird.y + bird.height > pipe.y
            );
        };

        const update = () => {
            if (gameOverRef.current) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                context.font = "bold 48px serif";
                context.fillStyle = "red";
                context.textAlign = "center";
                context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
                context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            velocityY += gravity;
            bird.y = Math.max(bird.y + velocityY, 0);

            if (bird.y >= canvas.height - bird.height || bird.y <= 0) {
                setGameOver(true);
                gameOverRef.current = true;
                return;
            }

            context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

            for (let i = 0; i < pipeArray.length; i++) {
                const pipe = pipeArray[i];
                pipe.x += velocityX;
                context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

                if (!pipe.passed && pipe.x + pipe.width < bird.x) {
                    pipe.passed = true;

                    // Ensure both top and bottom pipes are passed before incrementing score
                    if (pipe.isTopPipe) {
                        const bottomPipeIndex = i + 1;
                        if (pipeArray[bottomPipeIndex] && pipeArray[bottomPipeIndex].passed) {
                            score++;
                            setScore(score);
                        }
                    } else {
                        const topPipeIndex = i - 1;
                        if (pipeArray[topPipeIndex] && pipeArray[topPipeIndex].passed) {
                            score++;
                            setScore(score);
                        }
                    }
                }

                if (detectCollision(bird, pipe)) {
                    setGameOver(true);
                    gameOverRef.current = true;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                    context.font = "bold 48px serif";
                    context.fillStyle = "red";
                    context.textAlign = "center";
                    context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
                    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
                    return;
                }
            }

            while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
                pipeArray.shift();
            }

            requestAnimationFrame(update);
        };

        const placePipes = () => {
            if (gameOverRef.current) return;

            const randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
            const openingSpace = boardHeight / 3;

            const topPipe = {
                img: topPipeImg,
                x: pipeX,
                y: randomPipeY,
                width: pipeWidth,
                height: pipeHeight,
                passed: false,
                isTopPipe: true,
            };
            pipeArray.push(topPipe);

            const bottomPipe = {
                img: bottomPipeImg,
                x: pipeX,
                y: randomPipeY + pipeHeight + openingSpace,
                width: pipeWidth,
                height: pipeHeight,
                passed: false,
                isTopPipe: false,
            };
            pipeArray.push(bottomPipe);
        };

        const moveBird = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
                velocityY = -7;

                if (gameOverRef.current) {
                    bird.y = birdY;
                    pipeArray = [];
                    setGameOver(false);
                    gameOverRef.current = false;
                    score = 0;
                    setScore(score);
                }
            }
        };

        canvas.height = boardHeight;
        canvas.width = boardWidth;

        bgImg.onload = () => {
            context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        };

        requestAnimationFrame(update);
        setInterval(placePipes, 2000); // Decreased the interval between pipe appearances
        document.addEventListener("keydown", moveBird);

        return () => {
            document.removeEventListener("keydown", moveBird);
        };
    }
}

const FlappyBirdGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const gameOverRef = useRef(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState("");

    const handleStartGame = (selectedLevel: string) => {
        setLevel(selectedLevel);
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
    };

    useEffect(() => {
        if (canvasRef.current && gameStarted) {
            startGame(canvasRef, setGameStarted, setGameOver, gameOverRef, setScore, level);
        }
    }, [canvasRef, gameStarted, level]);

    if (!gameStarted) {
        return (
            <div className="p-4 text-center">
                <h1 className="text-3xl mb-4">Flappy Bird</h1>
                <p>Select Level:</p>
                <button className="mx-2 px-4 py-2 bg-green-500 text-white rounded" onClick={() => handleStartGame("beginner")}>Beginner</button>
                <button className="mx-2 px-4 py-2 bg-yellow-500 text-white rounded" onClick={() => handleStartGame("intermediate")}>Intermediate</button>
                <button className="mx-2 px-4 py-2 bg-red-500 text-white rounded" onClick={() => handleStartGame("expert")}>Expert</button>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="p-4 text-center">
                <div className="mt-4">
                    <h2 className="text-2xl text-red-500 font-bold">Game Over</h2>
                    <h3 className="text-xl">Score: {score}</h3>
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setGameStarted(false)}>Play Again</button>
                </div>
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="mt-4 text-center">
                <h2>Score: {score}</h2>
            </div>
        </div>
    );
};

export default FlappyBirdGame;