import { fileCategories } from "@/config/portal";
import { FileUpload } from "../actions";
import { dateLabel, EmptyState, FileLinks } from "../project-components";
import type { SectionProps } from "./types";
export function FilesPanel({
  project,
  data,
  search,
  category,
}: SectionProps) {
  return (
    <section className="portal-card">
      <form className="portal-filters" method="get">
        <input type="hidden" name="projeto" value={project.id} />
        <div className="field">
          <label htmlFor="file-search">Buscar arquivo</label>
          <input
            id="file-search"
            name="busca"
            defaultValue={search}
            placeholder="Nome do arquivo"
            maxLength={100}
          />
        </div>
        <div className="field">
          <label htmlFor="file-filter">Categoria</label>
          <select id="file-filter" name="categoria" defaultValue={category}>
            <option value="">Todas as categorias</option>
            {fileCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>
        <button className="button button-secondary" type="submit">
          Filtrar
        </button>
      </form>
      <FileUpload projectId={project.id} />
      {data.items.length ? (
        <ul className="portal-list">
          {data.items.map((file) => (
            <li key={file.id}>
              <div>
                <strong>{file.name}</strong>
                <small>
                  {String(file.name).split(".").pop()?.toUpperCase()} ·{" "}
                  {(Number(file.size) / 1024).toFixed(1)} KB · {file.category}
                </small>
                <small>
                  {dateLabel(file.created_at, true)} · {file.author}
                </small>
              </div>
              <FileLinks file={file} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Nenhum arquivo encontrado"
          description="Documentos, materiais e entregas compartilhados estarão disponíveis aqui."
        />
      )}
    </section>
  );
}
