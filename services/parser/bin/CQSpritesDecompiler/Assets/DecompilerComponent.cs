using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

public class DecompilerComponent : MonoBehaviour
{
    public Camera usedCamera;

    void Start()
    {
        var spriteId = 0;
        var sysArgs = Environment.GetCommandLineArgs().ToList();

        var autoplay = sysArgs.Contains("-batchmode");

        var fileListPath = sysArgs
	        .SkipWhile(p => "--files" != p.ToLowerInvariant())
	        .Skip(1)
	        .FirstOrDefault();

        var outputPath = sysArgs
	        .SkipWhile(p => "--output" != p.ToLowerInvariant())
	        .Skip(1)
	        .FirstOrDefault();

        var scaleRaw = sysArgs
	        .SkipWhile(p => "--scale" != p.ToLowerInvariant())
	        .Skip(1)
	        .FirstOrDefault();

        if (!float.TryParse(scaleRaw, out var scale))
        {
	        scale = 1f;
        }

        Debug.Log($"Files {fileListPath}, output: {outputPath}, scale: {scale}");

        if (fileListPath == null || outputPath == null)
        {
	        Console.WriteLine("--files and --output must be provided, while --precise is optional");
	        EditorApplication.Exit(3314);
	        return;
        }

        var output = Path.GetFullPath(outputPath);

        string[] files;

        try
        {
	        files = File.ReadAllLines(fileListPath);
        }
        catch (Exception e)
        {
	        Debug.LogException(e);
	        EditorApplication.Exit(1111);
	        return;
        }

        foreach (var arg in files)
        {
	        Debug.Log($"Processing: {arg}");
	        try
	        {
		        var bundle = AssetBundle.LoadFromFile(Path.GetFullPath(arg));

		        var assets = bundle.LoadAllAssets(typeof(GameObject)).ToList();

		        assets.AddRange(bundle.LoadAllAssets(typeof(Texture2D)));

		        var objects = new List<GameObject>();

		        foreach (var asset in assets)
		        {
			        switch (asset)
			        {
				        case GameObject obj:
					        objects.Add(obj);
					        break;
			        }
		        }

		        foreach (var obj in objects)
		        {
			        var collectionData = obj.GetComponent<tk2dSpriteCollectionData>();

			        foreach (var a in collectionData.spriteDefinitions)
			        {
				        try
				        {
					        var go = new GameObject($"sprite_{a.name}.{spriteId++}");

					        var sprite = go.AddComponent<tk2dSprite>();
					        sprite.SetSprite(collectionData, a.name);
					        sprite.GetCurrentSpriteDef().materialInst.shader = Shader.Find("tk2d/Blend2TexVertexColor");

					        var b = sprite.GetBounds();
					        var bSize = b.size;

					        var renderRes = RenderTexture.GetTemporary((int) Math.Floor(bSize.x),
						        (int) Math.Floor(bSize.y), 0, RenderTextureFormat.ARGB32);
					        var res = new Texture2D((int) Math.Floor(bSize.x), (int) Math.Floor(bSize.y),
						        TextureFormat.ARGB32, false);

					        RenderTexture.active = usedCamera.targetTexture = renderRes;

					        usedCamera.orthographicSize = b.size.y * .5f;

					        go.transform.position = -b.center;

					        usedCamera.Render();

					        var rect = new Rect(Vector2.zero, b.size);

					        res.ReadPixels(rect, 0, 0);
					        res.Apply();

					        RenderTexture.ReleaseTemporary(renderRes);

					        RenderTexture.active = usedCamera.targetTexture = null; //can help avoid errors

					        File.WriteAllBytes(Path.Combine(output, $"{a.name}.png"),
						        Resize(res, (int) (rect.width * scale), (int) (rect.height * scale))
							       .EncodeToPNG()
						    );

					        DestroyImmediate(sprite);
				        }
				        catch (Exception e)
				        {
					        Console.WriteLine(e.Message);
				        }
			        }
		        }
	        }
	        catch (Exception e)
	        {
		        Console.WriteLine(e.Message);
	        }
        }

        if (autoplay)
	        EditorApplication.Exit(0);
    }

    private static Texture2D Resize(Texture2D source, int newWidth, int newHeight)
    {
	    source.filterMode = FilterMode.Point;
	    var rt = RenderTexture.GetTemporary(newWidth, newHeight);
	    rt.filterMode = FilterMode.Point;
	    RenderTexture.active = rt;
	    Graphics.Blit(source, rt);
	    var nTex = new Texture2D(newWidth, newHeight);
	    nTex.ReadPixels(new Rect(0, 0, newWidth, newHeight), 0,0);
	    nTex.Apply();
	    RenderTexture.active = null;
	    RenderTexture.ReleaseTemporary(rt);
	    return nTex;
    }
}
