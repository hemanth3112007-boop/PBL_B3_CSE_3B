import os
import sys
import zipfile
import cv2
import numpy as np

video_path = 'public/assets/aistudio/gemini_generated_video_3ad3f822_b0f5d918.mp4'
output_zip = 'campus_frames_day.zip'
output_dir = 'public/assets/frames_day'
os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Error opening video {video_path}")
    sys.exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_video_frames / fps if fps > 0 else 10.0
print(f"Video opened: {total_video_frames} frames at {fps} FPS, duration: {duration:.2f}s")

NUM_FRAMES = 240
# Calculate timestamps from 0.0s to 10.0s segment
target_duration = min(10.0, duration) if duration > 0 else 10.0
timestamps = np.linspace(0.0, target_duration, NUM_FRAMES, endpoint=False)

clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8))
zip_file = zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED)

last_valid_frame = None

for i in range(NUM_FRAMES):
    t = timestamps[i]
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000.0)
    ret, frame = cap.read()
    
    if not ret or frame is None:
        if last_valid_frame is not None:
            frame = last_valid_frame.copy()
        else:
            print(f"Error: frame {i} could not be read and no previous frame available")
            continue
    else:
        last_valid_frame = frame

    # 1. Resize each frame to 1920x1080 using cv2.INTER_LANCZOS4
    resized = cv2.resize(frame, (1920, 1080), interpolation=cv2.INTER_LANCZOS4)

    # 2. Convert to LAB color space
    lab = cv2.cvtColor(resized, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    # Apply mild local contrast (cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8,8))) on L channel
    l_clahe = clahe.apply(l)

    # Apply fine sub-pixel unsharp mask (sigmaX=0.65, weight 1.55 / -0.55) on L channel only
    blurred = cv2.GaussianBlur(l_clahe, (0, 0), sigmaX=0.65)
    l_sharp = cv2.addWeighted(l_clahe, 1.55, blurred, -0.55, 0)

    # Merge back to BGR
    lab_sharp = cv2.merge([l_sharp, a, b])
    bgr_sharp = cv2.cvtColor(lab_sharp, cv2.COLOR_LAB2BGR)

    # 3. Save at JPEG quality 92 and bundle into campus_frames_day.zip
    frame_name = f"frame_{str(i + 1).zfill(3)}.jpg"
    frame_path = os.path.join(output_dir, frame_name)
    
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), 92]
    cv2.imwrite(frame_path, bgr_sharp, encode_params)

    # Add to zipfile
    zip_file.write(frame_path, arcname=frame_name)

    if (i + 1) % 40 == 0 or i == NUM_FRAMES - 1:
        print(f"Processed frame {i + 1}/{NUM_FRAMES}")

zip_file.close()
cap.release()
print(f"Completed! Successfully created {output_zip} and extracted {NUM_FRAMES} frames into {output_dir}")
