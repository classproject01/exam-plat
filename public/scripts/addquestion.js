function addQuestion() {
    const wrapper = document.getElementById('questions-wrapper');
    wrapper.insertAdjacentHTML('beforeend', `
      <h5>New Question</h5>
      <div class="mb-3">
        <input type="text" name="questions[]" placeholder="Question text" class="form-control" required>
      </div>
      <div class="mb-3">
        <input type="text" name="option1[]" placeholder="Option 1" class="form-control">
        <input type="text" name="option2[]" placeholder="Option 2" class="form-control mt-2">
        <input type="text" name="option3[]" placeholder="Option 3" class="form-control mt-2">
        <input type="text" name="option4[]" placeholder="Option 4" class="form-control mt-2">
        <input type="text" name="correct[]" placeholder="Correct Answer" class="form-control mt-2">
      </div>
      <div class="mb-3">
        <label>Add Image or Video (optional)</label>
        <input type="file" name="media[]" class="form-control">
      </div>
    `);
  }