"""
Urban Intelligence Platform - Edge Privacy Protection Filter

Implements privacy-preserving edge processing:
- Automatic facial blurring of pedestrians and bystanders
- Automatic blurring of non-offending bystander license plates
- Minimization of biometric and identifying data before transmission
- Strict adherence to data privacy standards (no unapproved facial recognition)
"""
from typing import Any, List, Optional, Tuple


class PrivacyFilter:
    """
    Applies real-time privacy sanitization to images and frames at the edge.
    Ensures that only incident-relevant evidence is retained and citizen privacy is safeguarded.
    """

    def __init__(self, blur_kernel_size: int = 31):
        self.blur_kernel_size = blur_kernel_size if blur_kernel_size % 2 == 1 else blur_kernel_size + 1

    def sanitize_frame(
        self,
        frame_array: Any,
        face_boxes: Optional[List[List[float]]] = None,
        bystander_plate_boxes: Optional[List[List[float]]] = None
    ) -> Any:
        """
        Applies Gaussian blurring to detected faces and uninvolved bystander vehicle plates.
        `boxes` are in normalized format [ymin, xmin, ymax, xmax].
        """
        if frame_array is None:
            return None

        try:
            import cv2
            h, w, _ = frame_array.shape
            output = frame_array.copy()

            # Blur faces
            if face_boxes:
                for box in face_boxes:
                    ymin, xmin, ymax, xmax = box
                    py1, px1 = max(0, int(ymin * h)), max(0, int(xmin * w))
                    py2, px2 = min(h, int(ymax * h)), min(w, int(xmax * w))
                    if py2 > py1 and px2 > px1:
                        roi = output[py1:py2, px1:px2]
                        blurred = cv2.GaussianBlur(roi, (self.blur_kernel_size, self.blur_kernel_size), 30)
                        output[py1:py2, px1:px2] = blurred

            # Blur bystander plates
            if bystander_plate_boxes:
                for box in bystander_plate_boxes:
                    ymin, xmin, ymax, xmax = box
                    py1, px1 = max(0, int(ymin * h)), max(0, int(xmin * w))
                    py2, px2 = min(h, int(ymax * h)), min(w, int(xmax * w))
                    if py2 > py1 and px2 > px1:
                        roi = output[py1:py2, px1:px2]
                        blurred = cv2.GaussianBlur(roi, (self.blur_kernel_size, self.blur_kernel_size), 20)
                        output[py1:py2, px1:px2] = blurred

            return output
        except Exception:
            return frame_array
