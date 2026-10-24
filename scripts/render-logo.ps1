Add-Type -AssemblyName System.Drawing

function Generate-RouteCaseLogo {
    param(
        [int]$size = 512,
        [string]$outputPath
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]($size / 512.0)

    # 1. Base Squircle Container (Deep modern slate background)
    $pad = [float](24 * $scale)
    $bgRect = [System.Drawing.RectangleF]::new($pad, $pad, [float]($size - 2 * $pad), [float]($size - 2 * $pad))
    $cornerRad = [float](96 * $scale)

    $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = [float]($cornerRad * 2)
    $bgPath.AddArc($bgRect.X, $bgRect.Y, $d, $d, 180, 90)
    $bgPath.AddArc([float]($bgRect.Right - $d), $bgRect.Y, $d, $d, 270, 90)
    $bgPath.AddArc([float]($bgRect.Right - $d), [float]($bgRect.Bottom - $d), $d, $d, 0, 90)
    $bgPath.AddArc($bgRect.X, [float]($bgRect.Bottom - $d), $d, $d, 90, 90)
    $bgPath.CloseFigure()

    # Rich dark gradient: #0F172A (slate-900) to #020617 (slate-950)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.PointF]::new(0, 0),
        [System.Drawing.PointF]::new($size, $size),
        [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
        [System.Drawing.Color]::FromArgb(255, 2, 6, 23)
    )
    $g.FillPath($bgBrush, $bgPath)

    # Subtle inner border for premium finish
    $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 56, 189, 248)), ([float](2.5 * $scale))
    $g.DrawPath($borderPen, $bgPath)

    # 2. Briefcase Handle (Top Arch)
    $handleW = [float](130 * $scale)
    $handleH = [float](48 * $scale)
    $handleX = [float](($size - $handleW) / 2)
    $handleY = [float](108 * $scale)
    $handleRadius = [float](24 * $scale)

    $handlePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $hd = [float]($handleRadius * 2)
    $handlePath.AddArc($handleX, $handleY, $hd, $hd, 180, 90)
    $handlePath.AddLine([float]($handleX + $handleRadius), $handleY, [float]($handleX + $handleW - $handleRadius), $handleY)
    $handlePath.AddArc([float]($handleX + $handleW - $hd), $handleY, $hd, $hd, 270, 90)
    $handlePath.AddLine([float]($handleX + $handleW), [float]($handleY + $handleRadius), [float]($handleX + $handleW), [float]($handleY + $handleH))
    
    $handlePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 148, 163, 184)), ([float](14 * $scale))
    $handlePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $handlePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawPath($handlePen, $handlePath)

    # 3. Briefcase Body (Main case container)
    $caseW = [float](330 * $scale)
    $caseH = [float](230 * $scale)
    $caseX = [float](($size - $caseW) / 2)
    $caseY = [float](150 * $scale)
    $caseRad = [float](36 * $scale)

    $caseRect = [System.Drawing.RectangleF]::new($caseX, $caseY, $caseW, $caseH)
    $casePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $cd = [float]($caseRad * 2)
    $casePath.AddArc($caseRect.X, $caseRect.Y, $cd, $cd, 180, 90)
    $casePath.AddArc([float]($caseRect.Right - $cd), $caseRect.Y, $cd, $cd, 270, 90)
    $casePath.AddArc([float]($caseRect.Right - $cd), [float]($caseRect.Bottom - $cd), $cd, $cd, 0, 90)
    $casePath.AddArc($caseRect.X, [float]($caseRect.Bottom - $cd), $cd, $cd, 90, 90)
    $casePath.CloseFigure()

    # Case fill: sleek dark slate with subtle depth
    $caseBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.PointF]::new($caseX, $caseY),
        [System.Drawing.PointF]::new($caseX, [float]($caseY + $caseH)),
        [System.Drawing.Color]::FromArgb(255, 30, 41, 59),
        [System.Drawing.Color]::FromArgb(255, 15, 23, 42)
    )
    $g.FillPath($caseBrush, $casePath)

    # Case border
    $caseBorderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 56, 189, 248)), ([float](4 * $scale))
    $g.DrawPath($caseBorderPen, $casePath)

    # 4. Case Split / Latch Line
    $splitY = [float]($caseY + (72 * $scale))
    $splitPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 56, 189, 248)), ([float](3 * $scale))
    $g.DrawLine($splitPen, [float]($caseX + (12 * $scale)), $splitY, [float]($caseX + $caseW - (12 * $scale)), $splitY)

    # Central Latch
    $latchW = [float](44 * $scale)
    $latchH = [float](26 * $scale)
    $latchX = [float](($size - $latchW) / 2)
    $latchY = [float]($splitY - ($latchH / 2))
    $latchBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $latchRect = [System.Drawing.RectangleF]::new($latchX, $latchY, $latchW, $latchH)
    
    $latchPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $ld = [float](8 * $scale)
    $latchPath.AddArc($latchRect.X, $latchRect.Y, $ld, $ld, 180, 90)
    $latchPath.AddArc([float]($latchRect.Right - $ld), $latchRect.Y, $ld, $ld, 270, 90)
    $latchPath.AddArc([float]($latchRect.Right - $ld), [float]($latchRect.Bottom - $ld), $ld, $ld, 0, 90)
    $latchPath.AddArc($latchRect.X, [float]($latchRect.Bottom - $ld), $ld, $ld, 90, 90)
    $latchPath.CloseFigure()
    $g.FillPath($latchBrush, $latchPath)

    # 5. Route Path & Checkmark inside the lower section
    # Route starts at Node 1 (lower left), moves to Node 2 (center), and sweeps up into a Checkmark (right)
    $p1 = [System.Drawing.PointF]::new([float]($caseX + (60 * $scale)), [float]($caseY + (168 * $scale)))
    $p2 = [System.Drawing.PointF]::new([float]($caseX + (145 * $scale)), [float]($caseY + (168 * $scale)))
    $chkVertex = [System.Drawing.PointF]::new([float]($caseX + (205 * $scale)), [float]($caseY + (182 * $scale)))
    $chkEnd = [System.Drawing.PointF]::new([float]($caseX + (270 * $scale)), [float]($caseY + (112 * $scale)))

    # Route connection 1: p1 to p2 (electric cyan)
    $routePen1 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 56, 189, 248)), ([float](10 * $scale))
    $routePen1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $routePen1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($routePen1, $p1, $p2)

    # Route connection 2 into Checkmark: p2 to chkVertex to chkEnd (emerald green)
    $chkPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $chkPath.AddLine($p2, $chkVertex)
    $chkPath.AddLine($chkVertex, $chkEnd)

    $chkPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 52, 211, 153)), ([float](12 * $scale))
    $chkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $chkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $chkPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPath($chkPen, $chkPath)

    # Node 1: Outer glow & dot (Origin Endpoint - Cyan)
    $n1Rad = [float](15 * $scale)
    $n1Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillEllipse($n1Brush, [float]($p1.X - $n1Rad), [float]($p1.Y - $n1Rad), [float]($n1Rad * 2), [float]($n1Rad * 2))
    $n1RingPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 56, 189, 248)), ([float](4 * $scale))
    $g.DrawEllipse($n1RingPen, [float]($p1.X - $n1Rad), [float]($p1.Y - $n1Rad), [float]($n1Rad * 2), [float]($n1Rad * 2))

    # Node 2: Route Waypoint (Cyan with white core)
    $n2Rad = [float](13 * $scale)
    $n2Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $g.FillEllipse($n2Brush, [float]($p2.X - $n2Rad), [float]($p2.Y - $n2Rad), [float]($n2Rad * 2), [float]($n2Rad * 2))
    $n2Inner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillEllipse($n2Inner, [float]($p2.X - (5 * $scale)), [float]($p2.Y - (5 * $scale)), [float](10 * $scale), [float](10 * $scale))

    # Node 3: Checkmark Tip (Emerald success dot)
    $n3Rad = [float](10 * $scale)
    $n3Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 52, 211, 153))
    $g.FillEllipse($n3Brush, [float]($chkEnd.X - $n3Rad), [float]($chkEnd.Y - $n3Rad), [float]($n3Rad * 2), [float]($n3Rad * 2))

    # Save output
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Successfully generated $outputPath ($size x $size)"
}

Generate-RouteCaseLogo -size 512 -outputPath "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\publisher-logo.png"
Generate-RouteCaseLogo -size 256 -outputPath "c:\Users\shanu\OneDrive\Desktop\vscodeextension\resources\icon.png"
