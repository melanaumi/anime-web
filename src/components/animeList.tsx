import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import client from '../graphql/client';
import ReactPaginate from 'react-paginate';
import { css, cx } from '@emotion/css';
import Header from "./header";
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

const AnimeList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedAnime, setSelectedAnime] = useState<string[]>([]);
    const [selectedAnimeCollections, setSelectedAnimeCollections] = useState<Record<string, string[]>>({});
    const [collectionName, setCollectionName] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnimeToAdd, setSelectedAnimeToAdd] = useState('');
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedAnimeId, setSelectedAnimeId] = useState('');

    const perPage = 10;

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

    const openModal = (animeId: string) => {
        setSelectedAnimeToAdd(animeId);
        setIsModalOpen(true);
    };

    const openModalDetail = (animeId: string) => {
        setSelectedAnimeId(animeId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedAnimeId('');
        setIsModalOpen(false);
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
            <h2>See What's Next!</h2>
            <ul className={styles.animeList}>
                {data.Page.media.map((anime: any) => (
                    <li key={anime.id}>
                        <label>
                            <img src={anime.coverImage.medium} alt={anime.title.romaji} onClick={() => openModalDetail(anime.id)} />
                            <h3 onClick={() => openModalDetail(anime.id)}>{anime.title.romaji}</h3>
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
                                    <label onClick={() => openModal(anime.id)}>Add to Collection</label>
                                </div>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            {/*<ReactModal isOpen={isModalOpen} onRequestClose={closeModal}>*/}
            {/*    {selectedAnimeId && (*/}
            {/*        <div>*/}
            {/*            <h2>{selectedAnime.title.romaji}</h2>*/}
            {/*            <p>{selectedAnime.description}</p>*/}
            {/*            /!* Add more details as needed *!/*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*    <button onClick={closeModal}>Close</button>*/}
            {/*</ReactModal>*/}

            <ReactModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
            >
                <h2>Add Anime to Collection</h2>
                <p>Anime ID: {selectedAnimeToAdd}</p>
                <button onClick={closeModal}>Close</button>
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
};

export default AnimeList;
