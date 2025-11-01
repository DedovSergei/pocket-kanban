import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, FormEvent } from 'react';
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd';
import { io } from 'socket.io-client';
import {
  fetchBoardById,
  addColumn,
  Board,
  Column,
  fetchCardsForBoard,
  createCard,
  Card,
  updateCardOrder,
  updateColumnOrder,
  deleteCard,
  updateBoardTitle,
  updateColumnTitle,
  updateCardText,
  deleteColumn
} from '../api';
import { InlineEdit } from '../components/InlineEdit';

interface AddCardFormProps {
  columnId: string;
  boardId: string;
}

function AddCardForm({ columnId, boardId }: AddCardFormProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await createCard(boardId, columnId, text);
      setText("");
      setError(null);
    } catch (err) {
      setError("Failed to create card");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <textarea
        value={text}
        onChange={e => setText(e.currentTarget.value)}
        placeholder="New card text"
        style={{ width: '100%', padding: '0.5rem', borderRadius: '3px' }}
        rows={3}
      />
      <button type="submit" style={{ padding: '0.5rem', marginTop: '0.5rem' }}>
        Add Card
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
    </form>
  );
}

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  
  useEffect(() => {
    if (id) {
      Promise.all([
        fetchBoardById(id),
        fetchCardsForBoard(id)
      ])
      .then(([boardData, cardsData]) => {
        setBoard(boardData);
        setCards(cardsData);
      })
      .catch(err => { setError(err.message); })
      .finally(() => { setLoading(false); });
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const socket = io('http://localhost:3001');

    const cardCreateEvent = `card:create:${id}`;
    const cardCreateHandler = (newCard: Card) => {
      setCards(prevCards => [...prevCards, newCard]);
    };
    
    const cardReorderEvent = `card:reorder:${id}`;
    const cardReorderHandler = (updatedCards: Card[]) => {
      setCards(prevCards => {
        const newCardsMap = new Map(updatedCards.map(c => [c._id, c]));
        const otherCards = prevCards.filter(c => !newCardsMap.has(c._id));
        return [...otherCards, ...updatedCards];
      });
    };

    const columnReorderEvent = `column:reorder:${id}`;
    const columnReorderHandler = (updatedColumns: Column[]) => {
      setBoard(prevBoard => 
        prevBoard ? { ...prevBoard, columns: updatedColumns } : null
      );
    };

    const cardDeleteEvent = `card:delete:${id}`;
    const cardDeleteHandler = (data: { cardId: string }) => {
      setCards(prevCards => prevCards.filter(card => card._id !== data.cardId));
    };

    const boardUpdateEvent = `board:update:${id}`;
    const boardUpdateHandler = (updatedBoard: Board) => {
      setBoard(updatedBoard);
    };

    const cardUpdateEvent = `card:update:${id}`;
    const cardUpdateHandler = (updatedCard: Card) => {
      setCards(prevCards => 
        prevCards.map(card => card._id === updatedCard._id ? updatedCard : card)
      );
    };

    socket.on(cardCreateEvent, cardCreateHandler);
    socket.on(cardReorderEvent, cardReorderHandler);
    socket.on(columnReorderEvent, columnReorderHandler);
    socket.on(cardDeleteEvent, cardDeleteHandler);
    socket.on(boardUpdateEvent, boardUpdateHandler);
    socket.on(cardUpdateEvent, cardUpdateHandler);

    return () => {
      socket.off(cardCreateEvent, cardCreateHandler);
      socket.off(cardReorderEvent, cardReorderHandler);
      socket.off(columnReorderEvent, columnReorderHandler);
      socket.off(cardDeleteEvent, cardDeleteHandler);
      socket.off(boardUpdateEvent, boardUpdateHandler);
      socket.off(cardUpdateEvent, cardUpdateHandler);
      socket.disconnect();
    };
  }, [id]);

  const handleAddColumn = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newColumnTitle.trim()) return;
    try {
      await addColumn(id, newColumnTitle);
      setNewColumnTitle("");
    } catch (err) {
      setError('Failed to add column');
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (!board) return;

    if (type === 'COLUMN') {
      const newColumns = Array.from(board.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      const reorderedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index
      }));
      setBoard(prevBoard => 
        prevBoard ? { ...prevBoard, columns: reorderedColumns } : null
      );
      updateColumnOrder(board._id, reorderedColumns).catch(err => {
        console.error("Failed to save column reorder", err);
      });
      return;
    }

    const movedCard = cards.find(card => card._id === draggableId);
    if (!movedCard) return;

    let updatedCardsList = [...cards];

    if (source.droppableId === destination.droppableId) {
      const columnCards = updatedCardsList
        .filter(card => card.columnId === source.droppableId)
        .sort((a, b) => a.order - b.order);
      columnCards.splice(source.index, 1);
      columnCards.splice(destination.index, 0, movedCard);
      const reorderedCards = columnCards.map((card, index) => ({ ...card, order: index }));
      const otherCards = updatedCardsList.filter(card => card.columnId !== source.droppableId);
      setCards([...otherCards, ...reorderedCards]);
      
      const payload = reorderedCards.map(card => ({
        _id: card._id,
        order: card.order,
        columnId: card.columnId,
        boardId: board._id
      }));
      updateCardOrder(payload).catch(err => console.error("Failed to save reorder", err));

    } else {
      const cardWithNewColumn = { ...movedCard, columnId: destination.droppableId };
      const sourceColumnCards = updatedCardsList
        .filter(card => card.columnId === source.droppableId && card._id !== draggableId)
        .sort((a, b) => a.order - b.order)
        .map((card, index) => ({ ...card, order: index }));
      const destColumnCards = updatedCardsList
        .filter(card => card.columnId === destination.droppableId)
        .sort((a, b) => a.order - b.order);
      destColumnCards.splice(destination.index, 0, cardWithNewColumn);
      const reorderedDestCards = destColumnCards.map((card, index) => ({ ...card, order: index }));
      const otherCards = updatedCardsList.filter(
        card => card.columnId !== source.droppableId && card.columnId !== destination.droppableId
      );
      setCards([...otherCards, ...sourceColumnCards, ...reorderedDestCards]);

      const payload = [...sourceColumnCards, ...reorderedDestCards].map(card => ({
        _id: card._id,
        order: card.order,
        columnId: card.columnId,
        boardId: board._id
      }));
      updateCardOrder(payload).catch(err => console.error("Failed to save reorder", err));
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
    } catch (err) {
      console.error("Failed to delete card", err);
    }
  };

  const handleRenameBoard = async (newTitle: string) => {
    if (!board) return;
    await updateBoardTitle(board._id, newTitle);
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    if (!board) return;
    await updateColumnTitle(board._id, columnId, newTitle);
  };

  const handleRenameCard = async (cardId: string, newText: string) => {
    await updateCardText(cardId, newText);
  };
  
  const handleDeleteColumn = async (columnId: string) => {
    if (!board) return;
    try {
      await deleteColumn(board._id, columnId);
    } catch (err) {
      console.error('Failed to delete column', err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading board...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!board) return <div style={{ padding: '2rem' }}>Board not found.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>
        ← Back to Boards
      </Link>
      <div style={{ textAlign: 'center' }}>
        <InlineEdit
          initialText={board.title}
          onSave={handleRenameBoard}
          className="board-title"
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ display: 'flex', gap: '1rem', marginTop: '2rem', alignItems: 'flex-start', overflowX: 'auto' }}
            >
              {board.columns.map((column, index) => (
                <Draggable key={column._id} draggableId={column._id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                      style={{ 
                        background: '#333', 
                        padding: '1rem', 
                        borderRadius: '4px', 
                        minWidth: '250px', 
                        flexShrink: 0,
                        ...provided.draggableProps.style 
                      }}
                    >
                      <div {...provided.dragHandleProps} style={{ paddingBottom: '0.5rem', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <InlineEdit
                          initialText={column.title}
                          onSave={(newTitle) => handleRenameColumn(column._id, newTitle)}
                          className="column-title"
                        />
                        <button 
                          onClick={() => handleDeleteColumn(column._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#aaa',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            lineHeight: '1',
                            padding: '0 4px'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                      
                      <Droppable droppableId={column._id} type="CARD">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '50px' }}
                          >
                            {cards
                              .filter(card => card.columnId === column._id)
                              .sort((a, b) => a.order - b.order)
                              .map((card, index) => (
                                <Draggable key={card._id} draggableId={card._id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      {...provided.draggableProps}
                                      ref={provided.innerRef}
                                      style={{
                                        background: snapshot.isDragging ? '#555' : '#444',
                                        borderRadius: '3px',
                                        position: 'relative',
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <div {...provided.dragHandleProps} style={{ paddingRight: '20px' }}>
                                        <InlineEdit
                                          initialText={card.text}
                                          onSave={(newText) => handleRenameCard(card._id, newText)}
                                          textArea={true}
                                          className="card-text"
                                        />
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteCard(card._id)}
                                        style={{
                                          position: 'absolute',
                                          top: '2px',
                                          right: '2px',
                                          background: 'none',
                                          border: 'none',
                                          color: '#aaa',
                                          cursor: 'pointer',
                                          fontSize: '1rem',
                                          lineHeight: '1',
                                          padding: '2px 4px'
                                        }}
                                      >
                                        &times; 
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <AddCardForm
                        columnId={column._id}
                        boardId={board._id}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              <form onSubmit={handleAddColumn} style={{ minWidth: '250px', flexShrink: 0 }}>
                <input
                  value={newColumnTitle}
                  onChange={e => setNewColumnTitle(e.currentTarget.value)}
                  placeholder="New column title"
                  style={{ padding: '0.5rem', width: '100%' }}
                />
                <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
                  Add Column
                </button>
              </form>

            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}