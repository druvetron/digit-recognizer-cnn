import tensorflow as tf
from tensorflow.keras import layers, models

print("1. Downloading and loading the MNIST dataset...")
# MNIST is split into training data (to learn) and testing data (to grade itself)
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()

print("2. Preprocessing the data...")
# Reshape the grids from (28, 28) to (28, 28, 1) because the CNN expects a color channel (1 for grayscale)
x_train = x_train.reshape((60000, 28, 28, 1))
x_test = x_test.reshape((10000, 28, 28, 1))

# Normalize the pixel values to be between 0 and 1 instead of 0 and 255. This helps the network learn faster.
x_train, x_test = x_train / 255.0, x_test / 255.0

print("3. Building the CNN Architecture...")
model = models.Sequential()

# Step 1: Convolutional Layer (Finding the pieces like curves and edges)
model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)))

# Step 2: Pooling Layer (Focusing on the strongest features and shrinking the map)
model.add(layers.MaxPooling2D((2, 2)))

# Step 3: Another Convolutional and Pooling layer to find even more complex patterns
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D((2, 2)))

# Step 4: Flattening (Converting 2D maps into a 1D list of numbers)
model.add(layers.Flatten())

# Step 5: Dense Layers (The complex voting system)
model.add(layers.Dense(64, activation='relu'))

# Step 6: Output Layer (10 nodes for digits 0-9 using Softmax for probabilities)
model.add(layers.Dense(10, activation='softmax'))

print("4. Compiling the model...")
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

print("5. Training the model! This will take a minute...")
# We train it for 5 "epochs" (full passes through the dataset)
model.fit(x_train, y_train, epochs=5, validation_data=(x_test, y_test))

print("6. Saving the trained model...")
# This exports the "brain" so we can load it into our API later
model.save('my_digit_model.keras')

print("done -> 'my_digit_model.keras'")
