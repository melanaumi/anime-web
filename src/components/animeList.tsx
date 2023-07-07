import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import client from '../graphql/client';
import ReactPaginate from 'react-paginate';
import { css, cx } from '@emotion/css';
import Header from './header';
import loadingImage from '../images/loading.webp';
import ReactModal from 'react-modal';

const ANIME_LIST_QUERY = gql`
  query GetAnimeList($perPage: Int!, $page: Int!) {
    Page(perPage: $perPage, page: $page) {
      pageInfo {
        total
        currentPage
      }
      media {
        id
        title {
          romaji
        }
        coverImage {
          medium
        }
        description
        episodes
        genres
        averageScore
      }
    }
  }
`;

const getInitials = (name: string): string => {
    const words: string[] = name.split(' ');
    const initials: string = words.map((word: string) => word.charAt(0)).join('');
    return initials.toUpperCase();
};

const AnimeList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedAnime, setSelectedAnime] = useState<string[]>([]);
    const [selectedAnimeCollections, setSelectedAnimeCollections] = useState<Record<string, string[]>>({});
    const [collectionList, setCollectionList] = useState<string[]>([]);
    const [collectionName, setCollectionName] = useState('');
    const [error, setError] = useState('');
    const [selectedAnimeId, setSelectedAnimeId] = useState('');

    const perPage = 10;

    useEffect(() => {
        const storedCollectionList = localStorage.getItem('collectionList');
        if (storedCollectionList) {
            setCollectionList(JSON.parse(storedCollectionList));
        }
    }, []);

    const handlePageChange = (selectedPage: { selected: number }) => {
        setCurrentPage(selectedPage.selected);
    };

    const { loading, data } = useQuery(ANIME_LIST_QUERY, {
        variables: { perPage, page: currentPage + 1 },
        client,
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <img src={loadingImage} alt="Loading" className={styles.loadingIcon} />
            </div>
        );
    }

    const pageCount = Math.ceil(data.Page.pageInfo.total / perPage);


    const handleSelectAnime = (animeId: string) => {
        setSelectedAnime((prevSelectedAnime) => {
            if (prevSelectedAnime.includes(animeId)) {
                return prevSelectedAnime.filter((id) => id !== animeId);
            } else {
                return [...prevSelectedAnime, animeId];
            }
        });
    };

    const handleSelectCollection = (animeId: string, collectionName: string) => {
        setSelectedAnimeCollections((prevSelectedAnimeCollections) => {
            const selectedCollections = prevSelectedAnimeCollections[animeId] || [];
            const updatedCollections = selectedCollections.includes(collectionName)
                ? selectedCollections.filter((name) => name !== collectionName)
                : [...selectedCollections, collectionName];

            return {
                ...prevSelectedAnimeCollections,
                [animeId]: updatedCollections,
            };
        });
    };

    const handleCreateCollection = () => {
        // Check if the collection name is already used
        const isNameUnique = validateCollectionName(collectionName);
        if (!isNameUnique) {
            setError('Collection name must be unique.');
            return;
        }

        // Check if the collection name contains special characters
        const hasSpecialCharacters = validateSpecialCharacters(collectionName);
        if (hasSpecialCharacters) {
            setError('Collection name cannot contain special characters.');
            return;
        }

        // Perform action to add the selected anime items to the selected collections
        console.log('New collection:', collectionName);
        console.log('Selected anime:', selectedAnime);
        console.log('Selected collections:', selectedAnimeCollections);

        // Add the collection name to the collection list
        const updatedCollectionList = [...collectionList, collectionName];
        setCollectionList(updatedCollectionList);

        // Save the updated collection list in local storage
        localStorage.setItem('collectionList', JSON.stringify(updatedCollectionList));

        // Reset input fields and error message
        setCollectionName('');
        setError('');
    };

    const validateCollectionName = (name: string) => {
        const existingCollectionNames = ['Collection 1', 'Collection 2', 'Collection 3'];
        return !existingCollectionNames.includes(name);
    };

    const validateSpecialCharacters = (name: string) => {
        const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
        return specialCharacterRegex.test(name);
    };

    const openModal = (animeId: string) => {
        setSelectedAnimeId(animeId);
    };

    const closeModal = () => {
        setSelectedAnimeId('');
    };

    return (
        <div className={styles.animeListContainer}>
            <Header />
            <div className={styles.collectionInput}>
                <input
                    type="text"
                    placeholder="Enter collection name"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                />
                <button onClick={handleCreateCollection}>Create Collection</button>
                {error && <p>{error}</p>}
            </div>
            {/* Display the collection list */}
            <div className={styles.collectionList}>
                {collectionList.length > 0 ? (
                    <>
                        <h2>Collection List</h2>
                        <div className={styles.collectionCards}>
                            {collectionList.map((collection) => (
                                <div key={collection} className={styles.collectionCard}>
                                    <div className={styles.initials}>{getInitials(collection)}</div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.collectionNames}>
                            {collectionList.map((collection) => (
                                <div key={collection} className={styles.collectionName}>{collection}</div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>No Collection List</p>
                )}
            </div>

            <h2>See What's Next!</h2>
            <ul className={styles.animeList}>
                {data.Page.media.map((anime: any) => (
                    <li key={anime.id}>
                        <label>
                            <img src={anime.coverImage.medium} alt={anime.title.romaji} onClick={() => openModal(anime.id)} />
                            <h3>{anime.title.romaji}</h3>
                            <div>
                                <p>Episodes: {anime.episodes}</p>
                                <p>Genres: {anime.genres.join(', ')}</p>
                                <p>Rating: {anime.averageScore}/100</p>
                                <div className="collection-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedAnime.includes(anime.id)}
                                        onChange={() => handleSelectAnime(anime.id)}
                                    />
                                    <label>Add to Collection</label>
                                </div>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            <ReactModal
                isOpen={Boolean(selectedAnimeId)}
                onRequestClose={closeModal}
                className={styles.modalContainer}
                overlayClassName={styles.modalOverlay}
            >
                {selectedAnimeId && (
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>
                            <span className={styles.closeIcon}>×</span>
                        </button>
                        <div className={styles.imageContainer}>
                            <img
                                src={data.Page.media.find((anime: any) => anime.id === selectedAnimeId).coverImage.medium}
                                alt={data.Page.media.find((anime: any) => anime.id === selectedAnimeId).title.romaji}
                                className={styles.image}
                            />
                        </div>
                        <div className={styles.textContainer}>
                            <h1>{data.Page.media.find((anime: any) => anime.id === selectedAnimeId).title.romaji}</h1>
                            <p>Episodes: {data.Page.media.find((anime: any) => anime.id === selectedAnimeId).episodes}</p>
                            <p>Genres: {data.Page.media.find((anime: any) => anime.id === selectedAnimeId).genres.join(', ')}</p>
                            <p>Rating: {data.Page.media.find((anime: any) => anime.id === selectedAnimeId).averageScore}/100</p>
                            <p>{data.Page.media.find((anime: any) => anime.id === selectedAnimeId).description}</p>
                        </div>
                    </div>
                )}
            </ReactModal>

            <ReactPaginate
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={cx(paginationStyles.container)}
                pageClassName={cx(paginationStyles.page)}
                activeClassName={cx(paginationStyles.activePage)}
                previousClassName={cx(paginationStyles.previous)}
                nextClassName={cx(paginationStyles.next)}
                breakClassName={cx(paginationStyles.break)}
                disabledClassName={cx(paginationStyles.disabled)}
            />
        </div>
    );
};

const paginationStyles = {
    container: css`
        display: flex;
        justify-content: center;
        margin-top: 20px;
        margin-bottom: 20px;
        list-style: none;
        padding: 0;
    `,
    page: css`
        margin: 0 5px;
        padding: 5px 10px;
        border: 1px solid #ffffff;
        border-radius: 6px;
        text-decoration: none;
        color: #ffffff;
        font-weight: bold;
        background-color: transparent;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #ccc;
        }
    `,
    activePage: css`
        font-weight: bold;
        background-color: #ccc;
    `,
    previous: css`
        margin-right: 10px;
        padding: 5px 10px;
        border: 1px solid #ffffff;
        border-radius: 6px;
        text-decoration: none;
        color: #ffffff;
        font-weight: bold;
        background-color: transparent;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #ccc;
        }
    `,
    next: css`
        margin-left: 10px;
        padding: 5px 10px;
        border: 1px solid #ffffff;
        border-radius: 6px;
        text-decoration: none;
        color: #ffffff;
        font-weight: bold;
        background-color: transparent;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #ccc;
        }
    `,
    break: css`
        margin: 0 5px;
        padding: 5px 10px;
        border: 1px solid #ffffff;
        border-radius: 6px;
        text-decoration: none;
        color: #ffffff;
        font-weight: bold;
        background-color: transparent;
        cursor: default;
    `,
    disabled: css`
        opacity: 0.5;
        cursor: not-allowed;
    `,
};

const styles = {
    animeListContainer: css`
      text-align: center;
      background-color: black;
      color: white;
  `,
    animeList: css`
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;

    li {
      border-radius: 4px;
      padding: 10px;
    }

    a {
      text-decoration: none;
      color: #333;
    }

      img {
        width: 100%;
        height: 200px; 
        object-fit: cover;
        border-radius: 5px;
        cursor: pointer;
      }

    h3 {
      margin-top: 10px;
      font-size: 20px;
      font-weight: bold; 
      color: #ffffff;
      text-align: left;
      height: 30px; 
      overflow: hidden; 
      text-overflow: ellipsis;
      white-space: nowrap; 
    }

    p {
      margin: 5px 0;
      font-size: 12px;
      text-align: left;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

      .collection-checkbox {
        display: flex;
        align-items: center;
      }

      .collection-checkbox input {
        margin: 0px;
      }

      .collection-checkbox label {
        display: flex;
        align-items: center;
        color: #ffffff;
        font-size: 12px;
        cursor: pointer;
        padding-left: 10px;
      }

      .collection-checkbox label:hover {
        text-decoration: underline;
      }
  `,
    collectionInput: css`
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 50%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;

      input[type="text"] {
        padding: 10px;
        border: none;
        border-radius: 4px;
        background-color: #f2f2f2;
        color: #333;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.3s ease;
        width: 400px;

        &:focus {
          outline: none;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        background-color: #ff3d00;
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #555;
        }

        &:focus {
          outline: none;
        }
      }

      p {
        margin-top: 10px;
        color: red;
      }
    `,
    loadingContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  `,
    collectionList: css`
    margin-top: 20px;

    h3 {
      color: white;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      margin-top: 5px;
      color: white;
    }
  `,
    loadingIcon: css`
    width: 100px;
    height: 100px;
    animation: spin 1s linear infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
    modalContainer: css`
      background-color: rgba(18, 36, 44, 0.95);
      //background-color: #000000;
      width: 1200px; 
      max-width: 100%;
      height: max-content;
      border-radius: 10px;
      margin: 0 auto;
      padding: 20px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `,
    modalOverlay: css`
      background-color: rgba(191, 191, 191, 0.5);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `,
    modalContent: css`
    display: grid;
    grid-template-columns: 0.7fr 1.3fr;
    //grid-gap: 20px;
    align-items: center;
    padding: 20px;
  `,
    imageContainer: css`
    display: flex;
    justify-content: flex-start;
  `,
    image: css`
    width: 80%;
    height: 60%;
    object-fit: cover;
      border-radius: 10px;
  `,
    textContainer: css`
    display: flex;
    flex-direction: column;
      color: #ffffff;
  `,
    closeButton: css`
    position: absolute;
    top: 10px;
    right: 15px;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  `,
    closeIcon: css`
    font-size: 24px;
    color: white;
      font-weight: bold;
  `,
    collectionCards: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
      margin: 10px;
  `,
    collectionCard: css`
    background-color: RGBA(98 ,39 ,19, 0.8);
    border-radius: 5px;
    padding: 10px;
    text-align: center;
  `,
    collectionName: css`
    margin: 0;
    font-weight: bold;
  `,
    collectionInitials: css`
    font-size: 24px;
    margin-bottom: 8px;
  `,
    initials: css`
    font-size: 30px;
      font-weight: bolder;
    `,
    collectionNames: css({
        marginTop: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        textAlign: 'center',
    }),
};

const modalContainerStyles = css`
  background-color: black;
`;

const modalOverlayStyles = css`
  background-color: rgba(0, 0, 0, 0.7);
`;

export default AnimeList;
