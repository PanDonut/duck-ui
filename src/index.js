import React, {useState, useRef, useReducer, useEffect} from 'react';
import { Stage, Layer, Line } from 'react-konva';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './logo.svg';
import './App.css';

const clamp = (val, in_min, in_max, out_min, out_max) => (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

function useWindowSize() {
  const isClient = typeof window === 'object'

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    }
  }

  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    if (!isClient) {
      return false
    }

    function handleResize() {
      setWindowSize(getSize())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export var Print = {}

Print = function(mess) { if ((window.location.href.includes("localhost:") || window.location.href.includes("127.0.0.1:")) && localStorage.getItem("duckui-show-console-messages") != "no") console.log(mess + " | These messages will appear only in development mode. If you don't want these messages set localStorage property 'duckui-show-console-messages' to 'no'");}
Print.warn = function(mess) { if ((window.location.href.includes("localhost:") || window.location.href.includes("127.0.0.1:")) && localStorage.getItem("duckui-show-console-messages") != "no") console.warn(mess + " | These messages will appear only in development mode. If you don't want these messages set localStorage property 'duckui-show-console-messages' to 'no'");}
Print.error = function(mess) { if ((window.location.href.includes("localhost:") || window.location.href.includes("127.0.0.1:")) && localStorage.getItem("duckui-show-console-messages") != "no") console.error(mess + " | These messages will appear only in development mode. If you don't want these messages set localStorage property 'duckui-show-console-messages' to 'no'");}

  /**
 * **Header element for mobile devices.**
 * @param {Boolean} fixed If set to true or not defined header's position will be fixed else if set to false header's position will be relative
 */
export function HeaderMobile({fixed}) {
  return (
    <div style={{position: fixed == true || fixed == undefined || fixed == null ? "fixed" : fixed == false ? 'relative' : ''}} className='_dui-header-mobile'></div>
  )
}

/**
 * **An element that can be turned fullscreen when dragged.
 * Contains a grid that can fit buttons with icons and a list of buttons underneath the grid.**
 * @param {Array} gridbuttons Array, that contains grid buttons data. @example [{"icon": {my_imported_image},"text": "Click Me!","action": {() => {myFunction()}}}]
 * @param {Array} listbuttons ***Optional***, Array that contains list buttons data. @example [{"text": "I'm a button!", "action": {() => {myFunction()}}}, {"text": "I'm a button too!", "action": {() => {myFunction()}}}]
 * @param {Number} topHook Stores element's position.
 * @param {Function} setHook Sets element's position.
 * @example
 *  const [top, setTop] = useState(65); // 65 is number for open, 5 is for fullscreen and 100 is for closed
 * ...
 *  return (
 *   ...
 *     <DraggableMobileGrid topHook={top} setHook={setTop}/>
 *   ...
 * )
 */
export function DraggableMobileGrid({gridbuttons, listbuttons, topHook, setHook}) {
  const size = useWindowSize();
  const [top, setTop] = useState(65);
  return (
    <div className='_dui-wrapper-drag-mob-grid'>
      <div className='_dui-dragger-bg' style={{opacity: (90 - topHook) / 100}} onClick={() => {setHook(100)}}></div>
    <div style={{top: `${topHook}%`}} className='_dui-drag-mob-grid'>
      <div className='_dui-dragger' onTouchStart={(e) => {console.log(e)}} onTouchMove={(e) => {if (topHook > 0) {setHook(clamp(e.touches[0].clientY, 0, size.height, 0, 100))}}} onTouchEnd={() => {if (topHook <= 50) {setHook(5)} else if (topHook > 50 && topHook < 80) {setHook(65)} else {setHook(100)}}}>
        <div/>
      </div>
      <div style={{gridAutoColumns: gridbuttons.length == 1 ? `50vw` : `${100 / gridbuttons.length}vw`, height: gridbuttons.length == 1 ? `50vw` : `${100 / gridbuttons.length}vw`}} className='_dui-wrapper-dragger-mobile-grid-grid'>
      {
        gridbuttons != undefined ?
        gridbuttons.map((item) => {
          return (
            <button key={item.text} onClick={item.action}><img src={item.icon}></img><p>{item.text}</p></button>
          )
        })
        : ''
      }
      </div>
      <div className='_dui-mgd'>
        {
          listbuttons != undefined ?
          listbuttons.map((item) => {
            return (
              <button key={item.text} onClick={item.action}>{item.text}</button>
            )
          })
          : ''
        }
      </div>
    </div>
    </div>
  )
}

export function UIContent(props) {
  return (
    <div className='_dui_main_content'>{props.children}</div>
  )
}

/**
 * Element that contains a drawable area.
 * @param {Number} width
 * @param {Number} height
 */
export const DrawingArea = ({onClearLines, clearLines, width, height}) => {

  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  useEffect(() => {
      //loadImage();
  }, [clearLines])
  
  const handleMouseDown = (e) => {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      setLines([...lines, { points: [pos.x, pos.y] }]);
  };
  
  const handleMouseMove = (e) => {
      // no drawing - skipping
      if (!isDrawing.current) {
        return;
      }
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
  
      // To draw line
      let lastLine = lines[lines.length - 1];
      
      if(lastLine) {
          // add point
          lastLine.points = lastLine.points.concat([point.x, point.y]);
              
          // replace last
          lines.splice(lines.length - 1, 1, lastLine);
          setLines(lines.concat());
      }
      
  };
  
const handleMouseUp = () => {
      isDrawing.current = false;
  };

  return (
      <div className="text-center text-dark _dui-draw-area">
          <Stage
              width={width}
              height={height}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="canvas-stage"
          >
              <Layer>
                  {lines.map((line, i) => (
                      <Line
                      key={i}
                      points={line.points}
                      stroke="#888"
                      strokeWidth={2}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                          line.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                      />
                  ))}
              </Layer>
          </Stage>
      </div>
  )
}

function App() {
  const [top, setTop] = useState(65);
  document.getElementById("root").className = "_dui-light-mode";
  return (
    <UIContent>
    <div className="App">
      <HeaderMobile fixed={true}/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <DrawingArea width={100} height={100} />
      </header>
      <DraggableMobileGrid gridbuttons={[{"text": "Zgłoś", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ96lrvoXbEiXlbj9_Czn6FwsFICjdoxiN_KQ&usqp=CAU"},{"text": "Zgłoś", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ96lrvoXbEiXlbj9_Czn6FwsFICjdoxiN_KQ&usqp=CAU"}]} listbuttons={[{"text": "I'm a button!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}, {"text": "I'm a button too!"}]} topHook={top} setHook={setTop} />
    </div>
    </UIContent>
  );
}
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);