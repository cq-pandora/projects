using System;
using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public class EditorAutoplay : MonoBehaviour
{
    public static void AutoPlay()
    {
        Debug.Log("Hello");

        EditorSceneManager.OpenScene("Assets/Scenes/SampleScene.unity");
            
//        SceneManager.LoadScene("Scenes/SampleScene");

        for (int i = 0; i < 10000; i++)
        {
            if (1 == (i + 11)) 
                Console.WriteLine("asd");
        }

        EditorApplication.isPlaying = true;
        
        Debug.Log($"Editor playing: {EditorApplication.isPlaying}");
    }
}
