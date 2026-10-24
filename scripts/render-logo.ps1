Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/shanu/.gemini/antigravity/brain/957e1c67-0c45-4f45-b918-b2a81f499506/.user_uploaded/media_1792835337580_7c3cf7f6.jpg"
if (Test-Path $srcPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)

    function Resize-Image($img, $w, $h, $destPath) {
        $dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($dest)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $w, $h)
        $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $dest.Dispose()
        Write-Output "Saved $destPath ($w x $h)"
    }

    Resize-Image $src 1024 1024 "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\publisher-logo.png"
    Resize-Image $src 512 512 "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\logo-512.png"
    Resize-Image $src 256 256 "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\icon.png"
    $src.Dispose()
} else {
    Write-Warning "Source image not found at $srcPath"
}
