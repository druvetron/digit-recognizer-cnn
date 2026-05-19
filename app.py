from flask import Flask , jsonify , request
from flask_cors import CORS
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CORS(app)

print("loading model..")
model = tf.keras.models.load_model('my_digit_model.keras')
print("Model loaded !")

@app.route('/predict' , methods = ['POST'])

def predict():
    try:
        # Get the pixel array 
        data = request.json
        pixel_grid = np.array(data['pixels'])
        
        # Reshape it to match the CNN's required input format: (1 image, 28x28, 1 color channel)
        # We also divide by 255.0 to normalize the data, just like we did during training
        processed_image = pixel_grid.reshape(1, 28, 28, 1) / 255.0
        
        # Make the prediction
        predictions = model.predict(processed_image)
        predicted_digit = int(np.argmax(predictions))
        
        return jsonify({'prediction': predicted_digit})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # Run the API on port 5000
    app.run(port=5000, debug=True)