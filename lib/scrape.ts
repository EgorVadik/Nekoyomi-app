// import {
//     COMPLETE_MANGA_URL,
//     FILTER,
//     GENRE_URL,
//     LATEST_URL,
//     MANGA_URL,
//     NEW_MANGA_URL,
//     POPULAR_URL,
//     SCRAPER_URL,
//     SEARCH_URL,
// } from '@/lib/constants'
// import {
//     type FilteredMangaSchema,
//     type MangaChapterSchema,
//     type MangaSchema,
//     type SearchSchema,
//     filteredMangaSchema,
//     mangaChapterSchema,
//     mangaSchema,
//     searchSchema,
// } from '@/lib/schema'
// import { api, parseString } from '@/lib/utils'
// import axios from 'axios'
// import cheerio from 'cheerio'

// export async function getChapter(args: MangaChapterSchema) {
//     try {
//         const { chapter, title } = mangaChapterSchema.parse(args)
//         const url = `${MANGA_URL}/${title}/${chapter}`
//         const { data } = await api.get(url)
//         const $ = cheerio.load(data)
//         const chapterContainer = $('.container-chapter-reader')
//         const chapterImages = chapterContainer.find('img')
//         const images = chapterImages.map((_, img) => $(img).attr('src')).get()
//         return images
//     } catch (error) {
//         console.error('Error:', error)
//         return null
//     }
// }

// export async function getChapterList(args: MangaSchema) {
//     try {
//         const { title } = mangaSchema.parse(args)
//         const url = `${MANGA_URL}/${title}`
//         const { data } = await api.get(url)
//         const $ = cheerio.load(data)
//         const chapterList = $('.chapter-list')
//         const chapters = chapterList.find('.row')
//         const chapterLinks = chapters
//             .map((_, chapter) => {
//                 const _chapter = $(chapter)
//                 const link = _chapter.find('a')
//                 const timeUploaded = _chapter.find('span[title]').attr('title')
//                 return {
//                     link: link.attr('href'),
//                     timeUploaded: timeUploaded ? new Date(timeUploaded) : null,
//                     title: parseString(link.text()),
//                 }
//             })
//             .get()
//         return {
//             totalChapters: chapterLinks.length,
//             chapters: chapterLinks,
//         }
//     } catch (error) {
//         console.error('Error:', error)
//         return null
//     }
// }

// export async function getMangaDetails(args: MangaSchema) {
//     try {
//         const parsedData = mangaSchema.parse(args)
//         const url = `${MANGA_URL}/${parsedData.title}`
//         const { data } = await api.get(url)
//         const $ = cheerio.load(data)
//         const mangaDetails = $('.manga-info-top')
//         const cover = mangaDetails.find('.manga-info-pic > img').attr('src')
//         const details = mangaDetails.find('.manga-info-text')
//         const title = details.find('h1').text()
//         const _author = details.find('li').eq(1).find('a')
//         const author = {
//             name: parseString(_author.text()),
//             link: _author.attr('href'),
//         }
//         const status = details.find('li').eq(2).text().split(':').at(-1)?.trim()
//         const lastUpdated = details
//             .find('li')
//             .eq(3)
//             .text()
//             .split(' : ')
//             .at(-1)
//             ?.trim()
//         const genres = details.find('.genres > a').map((_, genre) => {
//             const _genre = $(genre)
//             return {
//                 name: parseString(_genre.text()),
//                 link: _genre.attr('href'),
//             }
//         })
//         const description =
//             parseString($('#contentBox').text())
//                 .split('summary:')
//                 .at(-1)
//                 ?.trim() ?? ''
//         return {
//             cover,
//             title,
//             author,
//             status,
//             lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
//             genres: genres.get(),
//             description,
//         }
//     } catch (error) {
//         console.error('Error:', error)
//         return null
//     }
// }

// export async function searchManga(args: SearchSchema) {
//     try {
//         const { query } = searchSchema.parse(args)
//         const url = `${SEARCH_URL}/${query}`
//         const { data } = await axios.get(url, {
//             baseURL: SCRAPER_URL,
//         })
//         const $ = cheerio.load(data)
//         const searchResults = $('.panel_story_list')
//             .find('.story_item')
//             .map((_, story) => {
//                 const _story = $(story)
//                 const link = _story.find('a').attr('href')
//                 const cover = _story.find('a > img').attr('src')
//                 const details = _story.find('.story_item_right')
//                 const title = parseString(details.find('h3.story_name').text())

//                 return {
//                     cover,
//                     title,
//                     link,
//                 }
//             })
//             .get()
//         return searchResults
//     } catch (error) {
//         console.error('Error:', error)
//         return null
//     }
// }

// export async function getFilteredMangaList(args: FilteredMangaSchema) {
//     try {
//         const { type, page, genre, filter } = filteredMangaSchema.parse(args)
//         let url = ''

//         switch (type) {
//             case 'latest':
//                 url = LATEST_URL
//                 break
//             case 'popular':
//                 url = POPULAR_URL
//                 break
//             case 'new':
//                 url = NEW_MANGA_URL
//                 break
//             case 'completed':
//                 url = COMPLETE_MANGA_URL
//                 break
//             case 'genre':
//                 url = `${GENRE_URL}/${genre}`
//                 break
//         }

//         let filterKey: string | undefined

//         if (filter != null) {
//             filterKey = Object.entries(FILTER).find(
//                 ([_, value]) => value === filter
//             )?.[0]
//         }

//         const { data } = await api.get(url, {
//             params: {
//                 page,
//                 filter: filterKey ?? '4',
//             },
//         })
//         const $ = cheerio.load(data)
//         const mangaList = $('.truyen-list')
//             .find('.list-truyen-item-wrap')
//             .map((_, manga) => {
//                 const _manga = $(manga)
//                 const link = _manga.find('a.cover').attr('href')
//                 const cover = _manga.find('a.cover > img').attr('src')
//                 const title = parseString(_manga.find('h3 > a').text())
//                 return {
//                     cover,
//                     title,
//                     link,
//                 }
//             })
//             .get()
//         return mangaList
//     } catch (error) {
//         console.error('Error:', error)
//         return null
//     }
// }
