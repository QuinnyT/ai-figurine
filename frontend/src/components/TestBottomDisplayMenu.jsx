import React, {useEffect,useState,useContext} from "react"
import styles from "./TestBottomDisplayMenu.module.css"
import { SceneContext } from "../context/SceneContext"
import { ViewContext } from "../context/ViewContext"
import randomizeIcon from "../images/randomize-green.png"
import wireframeIcon from "../images/wireframe.png"
import solidIcon from "../images/solid.png"
import mouseFollowIcon from "../images/eye.png"
import mouseNoFollowIcon from "../images/no-eye.png"
import playIcon from "../images/play.png"
import reverseIcon from "../images/reverse.png"
import pauseIcon from "../images/pause.png"
import fastForwardIcon from "../images/fast-forward.png"
import fastBackwardIcon from "../images/fast-backward.png"

import { getFileNameWithoutExtension } from '../library/utils';
import { TokenBox } from "../components/token-box/TokenBox.jsx"

export default function TestBottomDisplayMenu({loadedAnimationName, randomize}){
  const {
    characterManager,
    toggleDebugMode,
    debugMode,
    lookAtManager,
    animationManager
  } = useContext(SceneContext);
  const [hasMouseLook, setHasMouseLook] = useState(lookAtManager.userActivated);
  const [animationName, setAnimationName] = useState(animationManager?.getCurrentAnimationName() || "");
  // const [allAnimations, setAllAnimations] = React.useState(animationManager?.getAllanimations() || []);
  const allAnimationsPaths = animationManager?.getAllAnimationPaths() || [];
  const allAnimationsPathsWithNames = allAnimationsPaths.map((path) => {
    return {
      path: path,
      name: getFileNameWithoutExtension(path)
    }
  })
  // console.log("allAnimationsPaths", allAnimationsPathsWithNames)

  useEffect(()=>{
    if (loadedAnimationName == null){
      loadedAnimationName = "T-Pose";
    }
    if (loadedAnimationName != ""){
      setAnimationName(loadedAnimationName);
    }
  },[loadedAnimationName])

  const clickDebugMode = () =>{
    toggleDebugMode()
  } 
  
  const handlePlayPauseMode = (play) =>{
    play ? animationManager.play() : animationManager.pause();
    animationManager.setSpeed(1);
  }

  const handlePlaySpeed = (speed) =>{
    animationManager.play()
    animationManager.setSpeed(speed);
  }

  const handleMouseLookEnable = () => {
    lookAtManager.setActive(!hasMouseLook);
    // should be called within lookatManager
    animationManager.enableMouseLook(!hasMouseLook);
    setHasMouseLook(!hasMouseLook);
  };

  const nextAnimation = async () => {
    console.log("play next")
    await animationManager.loadNextAnimation();
    setAnimationName(animationManager.getCurrentAnimationName());
  }
  const prevAnimation = async () => {
      console.log("play prev")
      await animationManager.loadPreviousAnimation();
      setAnimationName(animationManager.getCurrentAnimationName());
  }

  // Set horizontal scroll 
  const scrollRef = React.useRef(null);

  const [animationPanelIsShowing, setAnimationPanelIsShowing] = useState(false);


  useEffect(() => {
    const handleScroll = (event) => {
      event.preventDefault();
      scrollRef.current.scrollLeft += event.deltaY;
    };

    const element = scrollRef.current;
    if (element) {
      element.addEventListener("wheel", handleScroll, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener("wheel", handleScroll);
      }
    };
  }, [animationPanelIsShowing]);


  const selectAnimation = async (path) => {
    await animationManager.loadAnimation(path);
    setAnimationName(animationManager.getCurrentAnimationName());
  }

  const handleClickTriggerIcon = async ()  => {
    setAnimationPanelIsShowing(!animationPanelIsShowing);
    // setAnimationName("T-Pose");
    const defaultAnimationPath = allAnimationsPathsWithNames.find(item => item.name == 'T-Pose').path
    await animationManager.loadAnimation(defaultAnimationPath);
    setAnimationName(animationManager.getCurrentAnimationName());
  }

  return (
        <div className={styles["Container"]}>

            {/* My code */}
            <div className={styles["progressBarContainer"]}></div>
            <div className={styles["animationSelectorContainer"]} ref={scrollRef} >
              {allAnimationsPathsWithNames.map((animation) => {
                let active = animation.name === animationName
                return (
                  <div className={styles["animationButtons"]}  key={animation.name} onClick={() => selectAnimation(animation.path)}>
                    <TokenBox
                      size={40}
                      // icon={trait.fullThumbnail}
                      rarity={active ? "mythic" : "none"} 
                    />
                    <div>{animation.name}</div>
                  </div>
                )
                
              })}

            </div>
          </div>)}
          <img className={styles.triggerIcon} src="ui/animation.svg" onClick={handleClickTriggerIcon} />
        </div>
    );
}