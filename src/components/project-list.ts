import { Autobind } from '../decorators/autobind.js';
import { DragTarget } from '../models/drag-drop.js';
import { Project, ProjectStatus } from '../models/project.js';
import { projectState } from '../state/project-state.js';
import Component from './base-component.js';
import { ProjectItem } from './project-item.js';

// ProjectList Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
	assignedProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);
		this.assignedProjects = [];

		this.configure();
		this.renderContent();
	}

	@Autobind
	dragOverHandler(event: DragEvent): void {
		if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
			event.preventDefault();
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}

	@Autobind
	dropHandler(event: DragEvent): void {
		const prjId = event.dataTransfer!.getData('text/plain');
		projectState.moveProject(
			prjId,
			this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
		);
		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	@Autobind
	dragLeaveHandler(e: DragEvent): void {

		if (!this.element.contains(<Element>e.relatedTarget)) {
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.remove('droppable');
		}
	}

	configure(): void {
		this.element.addEventListener('dragover', this.dragOverHandler);
		this.element.addEventListener('dragleave', this.dragLeaveHandler);
		this.element.addEventListener('drop', this.dropHandler);

		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter(prj => {
				if (this.type === 'active') {
					return prj.status === ProjectStatus.Active;
				}
				return prj.status === ProjectStatus.Finished;
			});
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}

	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
	}

	private renderProjects() {
		const listElId = `${this.type}-projects-list`;
		const listEl = document.getElementById(listElId)! as HTMLUListElement;
		listEl.innerHTML = '';

		this.assignedProjects.forEach(prjItem => {
			new ProjectItem(listElId, prjItem);
			// new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
		});
	}
}
