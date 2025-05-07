import React, {useEffect, useState, useContext, useRef} from "react"
import styles from "./TestAnimationBottomDisplayMenu.module.css"
import { SceneContext } from "../context/SceneContext"

import { getFileNameWithoutExtension } from '../library/utils';
import { TokenBox } from "../components/token-box/TokenBox.jsx";

import { useChat } from "../hooks/useChat";

export default function TestAnimationBottomDisplayMenu({loadedAnimationName, randomize, selectedVoice}){
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
  console.log("allAnimationsPaths", allAnimationsPathsWithNames)

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

  const { chat, onMessagePlayed, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const input = useRef();
  const [audio, setAudio] = useState();

  const sendMessage = () => {
    const text = input.current.value;
    if (selectedVoice) {
      chat(text, selectedVoice.id);
    }
    else {
      chat(text, "LcfcDJNUP1GQjkzn1xUU");
    }
    input.current.value = "";
  }

  useEffect(() => {
    
    const loadAnimation = async (animationName) => {
      console.log("animationName", animationName)
      try {
        await animationManager.loadAnimation('./animations/interactions/' + animationName + '.fbx');
      } catch (error) {
        console.error('error:', error);
      }
    };

    if (message) {
      console.log("message", message)
      loadAnimation(message.animation);
      setAnimationName(animationManager.getCurrentAnimationName());
      const audio = new Audio("data:audio/mp3;base64," + message.audio);
      audio.play();
      setAudio(audio);
      audio.onended = onMessagePlayed;
    }
    
  }, [message]);


  return (
        <div className={styles["Container"]}>
          {animationPanelIsShowing && (
          <div className={styles["ContainerPosition"]}>
            {/* My code */}
            <div style={{  }}>Type your instructions here:</div>
            <textarea ref={input} className={styles["textField"]} placeholder="" />
            <img className={styles.sendIcon} src="ui/send.svg" onClick={sendMessage}/>
          </div>)}
          <img className={styles.triggerIcon} src="ui/animation.svg" onClick={handleClickTriggerIcon} />
        </div>
    );
}