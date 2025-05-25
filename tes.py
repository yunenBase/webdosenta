# import cv2

# # Buka webcam (0 = default webcam)
# cap = cv2.VideoCapture(2)

# # Cek apakah webcam berhasil dibuka
# if not cap.isOpened():
#     print("Gagal membuka webcam")
#     exit()

# # Set resolusi ke 640x480
# cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1080)
# cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# while True:
#     # Ambil frame dari webcam
#     ret, frame = cap.read()
#     if not ret:
#         print("Gagal membaca frame dari webcam")
#         break

#     # Tampilkan frame
#     cv2.imshow("Webcam", frame)

#     # Tekan 'q' untuk keluar
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # Bersihkan
# cap.release()
# cv2.destroyAllWindows()

#/////////////////////////////////////

# import cv2

# cap = cv2.VideoCapture(2)
# cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
# cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         break

#     # Resize ke 640x480 secara visual
#     resized_frame = cv2.resize(frame, (640, 360))

#     cv2.imshow("Resized Frame", resized_frame)

#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()

##########################################
import cv2
import numpy as np

def letterbox(img, new_size=(640, 640), color=(114, 114, 114)):
    """
    Resize dan padding agar gambar menjadi persegi dengan ukuran new_size,
    menjaga aspek rasio tanpa distorsi.
    """
    height, width = img.shape[:2]
    scale = min(new_size[0] / height, new_size[1] / width)
    new_w, new_h = int(width * scale), int(height * scale)

    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    pad_w = new_size[1] - new_w
    pad_h = new_size[0] - new_h
    top = pad_h // 2
    bottom = pad_h - top
    left = pad_w // 2
    right = pad_w - left

    padded = cv2.copyMakeBorder(resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)
    return padded, scale, (left, top)

cap = cv2.VideoCapture(2)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Resize dan padding ke 640x640
    padded_frame, scale, (pad_x, pad_y) = letterbox(frame, (640, 640))

    cv2.imshow("Padded Frame 640x640", padded_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
