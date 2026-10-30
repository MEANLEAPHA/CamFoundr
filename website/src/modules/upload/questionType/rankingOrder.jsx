import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {handleChange, deleteChoice, addChoice, removeAll, maxChoices} from "./util/choiceType";
import "./rankingorder.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faTrashCan,
  faUpDown,
  faArrowDown,
  faArrowUp,
  faPlus
} from "@fortawesome/free-solid-svg-icons";

export default function RankingOrder({ value, onChange }) {
  const items = value.length ? value : ["", "", ""];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(items);

    const [moved] = reordered.splice(result.source.index, 1);

    reordered.splice(result.destination.index, 0, moved);

    onChange(reordered);
  };



  return (
     <div className="question-type-wrapper">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ranking-list">
          {(provided) => (
            <div
              className="ranking-parent"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {items.map((item, index) => (
                <Draggable
                  key={index}
                  draggableId={String(index)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      className={`ranking-row ${
                        snapshot.isDragging ? "ranking-dragging" : ""
                      }`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                    >
                      <div
                        className="ranking-drag"
                        {...provided.dragHandleProps}
                      >
                       {index === 0 ? (
                          <FontAwesomeIcon icon={faArrowDown} />
                        ) : index === items.length - 1 ? (
                          <FontAwesomeIcon icon={faArrowUp} />
                        ) : (
                          <FontAwesomeIcon icon={faUpDown} />
                        )}
                        
                      </div>

                      <div className="ranking-number">
                        {index + 1}. 
                      </div>

                      <input
                        type="text"
                        className="ranking-input"
                        placeholder={`Rank ${index + 1}`}
                        value={item}
                        onChange={(e) =>
                          handleChange(index, e.target.value, items, onChange)
                        }
                      />

                      {items.length > 3 && (
                        <button
                          className="btn-delete-ranking"
                          onClick={() => deleteChoice(index, items, onChange)}
                          type="button"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>


      <div className="ranking-actions">
        <button
          onClick={() => addChoice(onChange, items)}
          disabled={items.length >= maxChoices}
          type="button"
          className="btn-multiple-choice"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add more 
        </button>
        {
          items.length > 3 && <span  className="btn-multiple-choice">|</span>
        }
        
        {items.length > 3 && (
          <button
            onClick={() => removeAll(items, onChange)}
            type="button"
            className=" btn-remove-ranking btn-multiple-choice"
          >
            Remove all
          </button>
        )}
      </div>
    </div>
  );
}
