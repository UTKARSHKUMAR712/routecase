Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/shanu/.gemini/antigravity/brain/957e1c67-0c45-4f45-b918-b2a81f499506/.user_uploaded/media_1792835337580_7c3cf7f6.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

# Create 32bpp ARGB bitmap for emerald rebrand
$dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for high-speed pixel transformation
$rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
$srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$destData = $dest.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = [Math]::Abs($srcData.Stride) * $h
$srcPixels = New-Object byte[] $bytes
$destPixels = New-Object byte[] $bytes

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcPixels, 0, $bytes)
$src.UnlockBits($srcData)

for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = [double]$srcPixels[$i]
    $g = [double]$srcPixels[$i + 1]
    $r = [double]$srcPixels[$i + 2]
    $a = $srcPixels[$i + 3]

    # Detect blue/cyan pixels: where blue or cyan dominates over red
    # White/gray text has r ≈ g ≈ b (diff is very small)
    $maxDiff = [Math]::Max([Math]::Abs($b - $r), [Math]::Abs($g - $r))
    $isColor = ($maxDiff -gt 25) -and ($b -gt $r -or $g -gt $r)

    if ($isColor) {
        # Transform cyan/blue into vibrant emerald green (#10B981 / #00DC82 / #34D399)
        $intensity = [Math]::Max($b, $g)
        $nR = [Math]::Min(255.0, ($r * 0.2 + $b * 0.08))
        $nG = [Math]::Min(255.0, ($intensity * 1.08))
        $nB = [Math]::Min(255.0, ($b * 0.38 + $r * 0.1))
        
        $destPixels[$i] = [byte]$nB
        $destPixels[$i + 1] = [byte]$nG
        $destPixels[$i + 2] = [byte]$nR
        $destPixels[$i + 3] = $a
    } else {
        # Keep neutral whites, grays, and dark background intact
        $destPixels[$i] = [byte]$b
        $destPixels[$i + 1] = [byte]$g
        $destPixels[$i + 2] = [byte]$r
        $destPixels[$i + 3] = $a
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($destPixels, 0, $destData.Scan0, $bytes)
$dest.UnlockBits($destData)
$src.Dispose()

# Now create rounded squircle icon function
function Create-RoundedIcon($srcBmp, $targetSize, $radiusRatio, $outPath) {
    $finalBmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($finalBmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $radius = [float]($targetSize * $radiusRatio)
    $dia = $radius * 2
    $rectF = [System.Drawing.RectangleF]::new(0, 0, $targetSize, $targetSize)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($rectF.X, $rectF.Y, $dia, $dia, 180, 90)
    $path.AddArc([float]($rectF.Right - $dia), $rectF.Y, $dia, $dia, 270, 90)
    $path.AddArc([float]($rectF.Right - $dia), [float]($rectF.Bottom - $dia), $dia, $dia, 0, 90)
    $path.AddArc($rectF.X, [float]($rectF.Bottom - $dia), $dia, $dia, 90, 90)
    $path.CloseFigure()

    $g.SetClip($path)
    $g.DrawImage($srcBmp, $rectF)
    $g.ResetClip()

    # Draw subtle modern emerald border around the rounded icon
    $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 16, 185, 129)), ([float](2 * ($targetSize / 256.0)))
    $g.DrawPath($borderPen, $path)

    $finalBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $finalBmp.Dispose()
    Write-Output "Generated rounded emerald icon: $outPath ($targetSize x $targetSize)"
}

# Generate 1024x1024, 512x512, and 256x256 with 22% rounded corner radius
Create-RoundedIcon $dest 1024 0.22 "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\publisher-logo.png"
Create-RoundedIcon $dest 512 0.22 "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\logo-512.png"
Create-RoundedIcon $dest 256 0.22 "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\icon.png"

# Copy to website public directory
Copy-Item "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\publisher-logo.png" -Destination "c:\Users\shanu\OneDrive\Desktop\vscodeextension\website\public\logo-1024.png" -Force
Copy-Item "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\logo-512.png" -Destination "c:\Users\shanu\OneDrive\Desktop\vscodeextension\website\public\logo-512.png" -Force
Copy-Item "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\icon.png" -Destination "c:\Users\shanu\OneDrive\Desktop\vscodeextension\website\public\logo.png" -Force
Copy-Item "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\icon.png" -Destination "c:\Users\shanu\OneDrive\Desktop\vscodeextension\website\public\favicon.png" -Force

$dest.Dispose()
