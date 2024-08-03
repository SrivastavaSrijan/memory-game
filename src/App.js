import "./styles.css";

/**
 * RADIO
 * Requirements
 * 1. Make a grid of cards -> Concat it with itself (OK)
 * 2. Each grid item contains one emoji each(OK)
 * 3. On every second click
 *  3.1 Check if the newly clicked grid item is same as the one triggered before
 *    3.1.1 If yes, let it be (OK)
 *    3.1.2 If no, turn if back after a delay (OK)
 * 4. When all cards are up, end the game.
 *
 * Architecture
 * <Grid>
 *  emojis -> <GridItem />
 *
 * Data Model
 * Use emojis array -> make sure length is equal
 *
 * Interface
 * Grid
 * selected Array<string[]> -> length - 2 max
 * GridItem
 * value
 * isRevealed
 * handleClick
 *
 * Optimizations
 * 1. CSS(OK)
 * 2. Randomize array each time(OK)
 * 3.
 *
 * Questions
 * 1. What if len of array is not mult of 2?
 * 2. How do I construct the grid?
 */
import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
const emojis = [
  "🐵",
  "🐶",
  "🦊",
  "🐱",
  "🦁",
  "🐯",
  "🐴",
  "🦄",
  "🦓",
  "🦌",
  "🐮",
  "🐷",
  "🐭",
  "🐹",
  "🐻",
  "🐨",
  "🐼",
  "🐽",
  "🐸",
  "🐰",
  "🐙",
  "😂",
  "😝",
  "😁",
  "😱",
  "👉",
  "🙌",
  "🍻",
  "🔥",
  "🌈",
  "☀",
  "🎈",
  "🌹",
  "💄",
  "🎀",
  "⚽",
  "🎾",
  "🏁",
  "😡",
  "👿",
  "🐬",
  "🐟",
  "🍀",
  "👀",
  "🚗",
  "🍎",
  "💝",
  "👌",
  "❤",
  "😍",
  "😉",
  "😓",
  "😳",
  "💪",
  "💩",
  "🍸",
  "🔑",
  "💖",
  "🌟",
  "🎉",
  "🌺",
  "🎶",
  "👠",
  "🏈",
  "⚾",
  "🏆",
  "👽",
  "💀",
  "🐩",
  "🐎",
  "💣",
  "🍓",
  "👊",
  "💋",
  "😘",
  "😜",
  "😵",
  "🙏",
  "👋",
  "🚽",
  "💃",
  "💎",
  "🚀",
  "🌙",
  "🎁",
  "⛄",
  "🌊",
  "⛵",
  "🏀",
  "🎱",
  "💰",
  "👶",
  "👸",
  "🐍",
  "🐫",
  "🔫",
  "👄",
  "🚲",
];

const shuffle = (array) => {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
};
function Header({ score, dim, initialDimensions, setDim }) {
  return (
    <div className="header">
      Memory Game
      <div className="header__size">
        <label>Size</label>
        <input
          type="number"
          min={2}
          step={2}
          defaultValue={initialDimensions}
          max={initialDimensions}
          onChange={(ev) => {
            setDim(Math.min(Math.max(+ev.target.value, 2), initialDimensions));
          }}
        />
      </div>
      <div className="header__score">Score: {score}</div>
    </div>
  );
}
function GridItem({ value, isRevealed, isMatched, handleReveal }) {
  return (
    <div
      className={[
        "grid__item",
        isRevealed && "grid__item--revealed",
        isMatched && "grid__item--matched",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleReveal}
    >
      <span
        className={[
          "grid__item__value",
          isRevealed && "grid__item__value--revealed",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
function Grid({ items: intialItems }) {
  const [matched, setMatched] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [counter, setCounter] = useState(1);
  const timerRef = useRef(null);

  const initialDimensions = Math.ceil(Math.sqrt(intialItems.length * 2));
  const [_dim, setDim] = useState(initialDimensions);
  const dim = useDeferredValue(_dim);
  const [items, setItems] = useState([]);
  const gridTemplateColumns = new Array(dim).fill("auto").join(" ");
  const handleReveal = (selection, index) => () => {
    setSelected((old) => {
      const selectionWithIndex = selection + "_" + index;
      const [existingValue, existingIndex] = old?.[0]?.split("_") ?? [];
      if (
        old.length === 1 &&
        existingValue === selection &&
        existingIndex !== index
      ) {
        setMatched((oldSet) => oldSet.add(selection));
        return [];
      } else if (old.length === 2) {
        setCounter((count) => count + 1);
        return [selectionWithIndex];
      } else {
        if (old.length === 1) setCounter((count) => count + 1);
        return [...old, selectionWithIndex];
      }
    });
  };

  const reset = () => {
    shuffle(intialItems);
    const slicedItems = intialItems.slice(0, Math.pow(dim / 2, 2));
    const newItems = [...slicedItems, ...slicedItems];
    shuffle(newItems);
    setItems(newItems);
    setSelected([]);
    setCounter(1);
    setMatched(new Set());
  };

  const score = useMemo(
    () =>
      Math.round((matched.size / ((items.length * counter) / (dim * 2))) * 100),
    [matched.size, items.length, counter]
  );
  const isDone = useMemo(
    () => matched.size === items.length / 2,
    [matched.size, items.length]
  );

  useEffect(() => {
    let timer;
    if (selected.length === 2) {
      timer = setTimeout(() => {
        setSelected([]);
      }, 1000);
    }
    return () => clearTimeout(timer); // Cleanup timer when component unmounts or selected changes
  }, [selected]);

  useEffect(() => {
    reset();
  }, [dim]);

  return (
    <div className="game__main">
      <div
        className={["overlay", isDone && "overlay--open"]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="overlay__element">
          <p>✨ Well Done! ✨</p>
          <button onClick={reset}>Reset</button>
        </div>
      </div>
      <Header
        score={score}
        dim={dim}
        initialDimensions={initialDimensions}
        setDim={setDim}
      />
      <div className="grid" style={{ gridTemplateColumns }}>
        {items.map((value, index) => {
          const valueWithIndex = value + "_" + index;
          return (
            <GridItem
              key={valueWithIndex}
              value={value}
              isMatched={matched.has(value)}
              isRevealed={
                selected.includes(valueWithIndex) || matched.has(value)
              }
              handleReveal={
                selected.includes(valueWithIndex)
                  ? null
                  : handleReveal(value, index)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
export default function MemoryGame() {
  return (
    <div className="game">
      <Grid items={emojis} />
    </div>
  );
}
