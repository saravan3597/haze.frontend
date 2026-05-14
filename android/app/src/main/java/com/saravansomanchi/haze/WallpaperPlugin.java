package com.saravansomanchi.haze;

import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;

@CapacitorPlugin(name = "Wallpaper")
public class WallpaperPlugin extends Plugin {

    @PluginMethod
    public void setWallpaper(PluginCall call) {
        String base64 = call.getString("base64");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing base64 image data");
            return;
        }

        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (bitmap == null) {
                call.reject("Failed to decode image");
                return;
            }

            WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());
            wallpaperManager.setBitmap(bitmap);

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Failed to set wallpaper: " + e.getMessage());
        }
    }
}
