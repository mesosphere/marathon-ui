PROJECT_NAME = "{{ project_name }}"


default: run


_requirements:
	@echo "Installing requirements"
	@pip install --exists-action=s -r requirements.txt

req: _requirements


_run_tests:
	@echo "Running tests"
	@python demo.py

run: _run_tests